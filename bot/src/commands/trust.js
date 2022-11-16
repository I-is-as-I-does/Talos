
const getProcessId = require('../operations/get-process-id.js')
const SheetsHandler = require('../utils/sheets.js')
const MembersHandler = require('../operations/members-handler.js')
const { getUserName, addRole } = require('../utils/butler.js')

const getCommand = require('../operations/get-command.js')
const { dsc_trust, dsc_discordId, dsc_walletAddress }= require('../../resources/descriptions.json')

const options = {
    name: 'trust',
    description: dsc_trust,
    hidden: false,
      okChannelIds: [process.env.OFFICE_CHANNEL_ID],
      redirectToChannel: null,
      okRoleIds: [process.env.ADMIN_ROLE_ID],
      unauthorizedMsg: null,
      arguments: [
        { name: 'id', description: dsc_discordId, type:"string", required: true },
        { name: 'address', description: dsc_walletAddress, type:"string", required: true },
      ],
      shHandler: SheetsHandler,
      teamCommand: true,
  }
const next = async function (prc) {
  var mbr = {}
  mbr.wallet_address = prc.arg.address
  mbr.discord_id = prc.arg.id

  const mbrsHandler = new MembersHandler(prc.shHandler)
  const membersData = await mbrsHandler.getMembersData()
  if (membersData) {
    mbr.id = mbr.discord_id + '_' + mbr.wallet_address
    if (membersData.index.includes(mbr.id)) {
      return await prc.replier.end('memberAlreadyExists')
    }
    var ids = mbrsHandler.getAllProcessIds()
    var processData = getProcessId(mbr.discord_id, ids, prc.interaction.client.logger)
    if(processData === false){
      return await prc.replier.end('adminFail')
    }

    mbr.process_id = processData.id+'#trusted'
    mbr.key = processData.key
    mbr.verified = true

    const success = await mbrsHandler.addMember(mbr)
    if (success) {
      const username = getUserName(prc.interaction, mbr.discord_id, mbr.discord_id)
      const roleAdded = addRole(prc.interaction, mbr.discord_id, process.env.COLLECTOR_ROLE_ID)
      var precision = ''
      if(!roleAdded){
        precision = '\n\n'+prc.gettxt.get('setRoleFail')
      }
      return await prc.replier.end('addedTrustedMember', {username:username, wallet:mbr.wallet_address, precision: precision})
    }
  }

  return await prc.replier.end('adminFail')
}

module.exports = getCommand(options, next)