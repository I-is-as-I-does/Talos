const fetch = require('node-fetch')
module.exports = class MembersHandler {
  constructor(SheetsHandler) {
    this.shHandler = SheetsHandler
    this.processIdsList = null
    this.range = 'members!A:i'

    this.props = [
      'id',
      'process_id',
      'wallet_address',
      'discord_id',
      'key',
      'created',
      'verified',
      'unlinked',
      'updated',
    ]

    this.time = Date.now()
    this.members = null
  }
  async fetchDescription(wallet_address) {
    const query = {
      query: `{
      user(id: "${wallet_address}") {
      description }
      }`,
    }
    try {
      const response = await fetch('https://api.fxhash.xyz/graphql', {
        method: 'post',
        body: JSON.stringify(query),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (
        data &&
        data.data &&
        data.data.user &&
        Object.prototype.hasOwnProperty.call(data.data.user, 'description')
      ) {
        return data.data.user.description
      }
      this.logInvalidResponse(wallet_address)
      return false
    } catch (e) {
      this.logInvalidResponse(wallet_address, e)
      return false
    }
  }

  logInvalidResponse(wallet_address, err = null) {
    var fields = [
      { name: 'request', value: 'fetchDescription' },
      { name: 'wallet_address', value: wallet_address },
    ]
    if (err) {
      fields.push({ name: 'error', value: err.message })
    }
    this.shHandler.logger.report('warning', 'Invalid Fxhash data', fields)
  }

  getAllProcessIds(){
    if (!this.shHandler.green || !this.members) {
      return false
    }
    if(this.processIdsList === null){
      this.processIdsList = this.members.entries.map(it => it.process_id)
    }
    return this.processIdsList
  }

  async setVerifiedMember(id) {
    if (!this.shHandler.green || !this.members) {
      return false
    }

    var idx = this.members.index.indexOf(id)
    if (idx === -1) {
      return false
    }
    this.members.entries[idx].unlinked = false
    this.members.entries[idx].verified = true
    this.members.entries[idx].updated = this.time
    var row = idx + 2
    var rowdata = []
    ;['verified', 'unlinked', 'updated'].forEach((k) => {
      rowdata.push(this.members.entries[idx][k])
    })

    return await this.shHandler.updateRows([
      {
        range: 'members!G' + row + ':I' + row,
        values: [rowdata],
      },
    ])
  }
  async unlinkMember(id) {
    if (!this.shHandler.green || !this.members) {
      return false
    }

    var idx = this.members.index.indexOf(id)
    if (idx === -1) {
      return false
    }

    this.members.entries[idx].unlinked = true
    this.members.entries[idx].updated = this.time
    var row = idx + 2
    var rowdata = []
    ;['unlinked', 'updated'].forEach((k) => {
      rowdata.push(this.members.entries[idx][k])
    })

    return await this.shHandler.updateRows([
      {
        range: 'members!H' + row + ':I' + row,
        values: [rowdata],
      },
    ])
  }
  async getMembersData() {
    if (!this.shHandler.green || this.members === false) {
      return false
    }
    if (this.members === null) {
      this.members = await this.shHandler.parseCollc(this.range)
    }
    return this.members
  }


  async addMember(mbr) {
    if (!this.shHandler.green || !this.members || this.members.index.includes(mbr.id)) {
      return false
    }
    mbr.unlinked = false
    mbr.created = this.time
    mbr.updated = ''
    var row = []
    this.props.forEach((prop) => {
      row.push(mbr[prop])
    })
    this.members.entries.push(mbr)
    this.members.index.push(mbr.id)
    return await this.shHandler.appendRows(this.range, [row])
  }
}
