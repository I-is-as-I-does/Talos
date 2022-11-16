const SheetsHandler = require('../utils/sheets.js')
const IterationsHandler = require('./iterations-handler.js')
const getCommand = require('../operations/get-command.js')
const {dsc_operationHash, dsc_instanceName} = require('../../resources/descriptions.json')


module.exports = function requestsCommand(name, description, then_next) {

    const options= {
      name: name,
      description: description,
      hidden: true,
      okChannelIds: [process.env.REDEEM_CHANNEL_ID],
      redirectToChannel: 'redeem',
      okRoleIds: [process.env.COLLECTOR_ROLE_ID],
      unauthorizedMsg: {key:'notVerified'},
      arguments: [
        { name: 'hash', description: dsc_operationHash, type:"string", required: true },
        { name: 'title', description: dsc_instanceName, type:"string", required: true },
      ],
      shHandler: SheetsHandler,
      teamCommand: false,
    }


   const next = async function (prc) {
      prc.itHandler = new IterationsHandler(prc.shHandler)
      const iterationsData = await prc.itHandler.prcIterationsData('operation_hash')
      if (iterationsData === false) {
        return await prc.replier.end('fail')
      }
  
      if (!iterationsData.list.operation_hash.includes(prc.arg.hash)) {
        return await prc.replier.end('nftNotFound')
      }
  
      const statusData = await prc.itHandler.getStatusData()
      if (statusData === false) {
        return await prc.replier.end('fail')
      }
  
      prc.itStatus = false
  
      const instanceName = prc.arg.title.toLowerCase()
      var candidates = []
  
      for (var i = 0; i < statusData.index.length; i++) {
        if (statusData.entries[i].operation_hash === prc.arg.hash) {
          if (statusData.entries[i].instance_name.toLowerCase() === instanceName) {
            prc.itStatus = statusData.entries[i]
            break
          }
          candidates.push(statusData.entries[i])
        }
      }
  
      if (prc.itStatus === false) {
        if(!candidates){
          return await prc.replier.end('notCurrentOwner')
        }
        if(candidates.length > 1){
          return await prc.replier.end('checkInstanceName')
        }
        
        prc.itStatus = candidates[0]
      }
  
      prc.discord_id = prc.interaction.user.id
  
      const owners = prc.itStatus.owner_discord_ids.split(',')
      if (!owners.includes(prc.discord_id)) {
        return await prc.replier.end('notCurrentOwner')
      }
      if (prc.itStatus.redeemed === true) {
        return await prc.replier.end('tokenRedeemed')
      }
  
      prc.discord_username = prc.interaction.user.username + '#' + prc.interaction.user.discriminator
      return await then_next(prc)
    }
    
  return getCommand(options, next)
  }
