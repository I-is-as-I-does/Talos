
const fetch = require('node-fetch')

module.exports = class IterationsHandler {
  constructor(SheetsHandler) {
    this.stats = { all: 0, added: 0, updated: 0 }
    this.shHandler = SheetsHandler
    this.iterations = null
    this.status = null
    this.pending = null
    this.range = { iterations: 'iterations!A:M', status: 'status!A:K', request:'requests!A:E', pending: 'pending!A:G', deliveries:'deliveries!A:C' }
    this.fxquery = {
      query: `{
      user(id: "${process.env.FXHASH_PROJECT_WALLET}") {
       generativeTokens {
         id,name,entireCollection {
           id, name,
           generationHash,
            metadata,
           owner {
             id, name
           }
           minter {
             id
             name
           }
         }
       }
     }
   }`,
    }

    this.props = [
      'id',
      'added',
      'instance_name',
      'instance_id',
      'token_name',
      'token_id',
      'ipfs_display_uri',
      'operation_hash',
      'minter_wallet',
      'minter_name',
      'owner_wallet',
      'owner_name',
      'owner_update',
    ]
  }

  getStats(){

    var stats = []
    for(let [k,v] of Object.entries(this.stats)){
      stats.push(k+': '+v)
    }
    stats = stats.join('\n')
    return stats
  }

  async addDelivery(delivery){
return  await this.shHandler.appendRows(this.range.deliveries, [delivery])
  }

  async getPendingData(){
    if (this.pending === null) {
      this.pending = await this.shHandler.parseCollc(this.range.pending)
    }
    return this.pending
  }

  async getStatusData() {
    if (this.status === null) {
      this.status = await this.shHandler.parseCollc(this.range.status)
    }
    return this.status
  }

  async addRequest(request_id, discord_id, discord_username){
       const row = [ [request_id, Date.now(), discord_id, discord_username, false]]
      return await this.shHandler.appendRows(this.range.request, row)
  }
  async updateRequest(request_row, discord_id, discord_username, cancelled){

    const upd = {
      range: 'requests!B' + request_row + ':E' + request_row,
      values: [ [Date.now(), discord_id, discord_username, cancelled]],
    }
    
   return await this.shHandler.updateRows(upd)
}


  async prcIterationsData(listkey = null) {
    if (this.iterations === null) {
      const success = await this.updateIterationsData()
      if (success) {
        if (listkey) {
          this.shHandler.setList(this.iterations, listkey)
        }
        return this.iterations
      }
      return false
    }

    if (listkey && !Object.prototype.hasOwnProperty.call(this.iterations.list, listkey)) {
      this.shHandler.setList(this.iterations, listkey)
    }
    return this.iterations
  }

  async updateIterationsData() {
    if (!this.shHandler.green || this.iterations === false) {
      return false
    }
    const collc = await this.shHandler.parseCollc(this.range.iterations)
    if (collc !== false) {
      const genTokens = await this.fetchFxhashData()
      if (genTokens !== false) {
        const success = await this.syncIterationsData(genTokens, collc)
        if (success) {
          return true
        }
      }
    }

    this.iterations = false
    return false
  }

  async fetchFxhashData() {
    const response = await fetch('https://api.fxhash.xyz/graphql', {
      method: 'post',
      body: JSON.stringify(this.fxquery),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    return this.getGenTokensData(data)
  }

  async syncIterationsData(genTokens, collc) {
    var add = []
    var upd = []

    var date = Date.now()
    genTokens.forEach((genToken) => {
      var items = this.getItemsData(genToken)
      if (items) {
        items.forEach((item) => {
          var id = genToken.id + '_' + item.id
          var idx = collc.index.indexOf(id)

          if (idx === -1) {
            var it = [
              id,
              date,
              genToken.name,
              genToken.id,
              item.name,
              item.id,
              item.metadata.displayUri.substring(7),
              item.generationHash,
              item.minter.id,
              item.minter.name,
              item.owner.id,
              item.owner.name,
              '',
            ]
            add.push(it)
            var obj = {}
            this.props.forEach((prop, i) => {
              obj[prop] = it[i]
            })
            collc.index.push(id)
            collc.entries.push(obj)
          } else if (item.owner.id !== collc.entries[idx].owner_wallet) {
            var upit = [item.owner.id, item.owner.name, date]
            var row = idx + 2
            upd.push({
              range: 'iterations!K' + row + ':M' + row,
              values: [upit],
            })
            collc.entries[idx].owner_wallet = item.owner.id
            collc.entries[idx].owner_name = item.owner.name
            collc.entries[idx].owner_update = date
          }
        })
      }
    })
    this.iterations = collc
    this.stats.all = collc.index.length
    this.stats.added = add.length
    this.stats.updated = upd.length

    return await this.writeIterationsUpdates(add, upd)
  }

  async writeIterationsUpdates(add, upd) {
    var err = 0
    if (add.length) {
      var appsuccess = await this.shHandler.appendRows(this.range.iterations, add) 
      if (!appsuccess) {
        err++
      }
    }
    if (err === 0 && upd.length) {
      var updsuccess = await this.shHandler.updateRows(upd)
      if (!updsuccess) {
        err++
      }
    }
    return err < 1
  }

  getItemsData(genToken) {
    var items = false
    var err = null
    try {
      if (genToken.entireCollection && Array.isArray(genToken.entireCollection)) {
        items = genToken.entireCollection
      }
    } catch (e) {
      err = e.message
    }
    if (items === false) {
      this.shHandler.logger.report('error', 'Invalid Fxhash data', [
        { name: 'generative-token', value: genToken },
        { name: 'error', value: err },
      ])
    }
    return items
  }

  getGenTokensData(data) {
    var genTokens = false
    var err = null
    try {
      if (data && data.data && data.data.user && Array.isArray(data.data.user.generativeTokens)) {
        genTokens = data.data.user.generativeTokens
      }
    } catch (e) {
      err = e.message
    }
    if (genTokens === false) {
      this.shHandler.report('error', 'Invalid Fxhash data', [{ name: 'error', value: err }])
    }
    return genTokens
  }
}
