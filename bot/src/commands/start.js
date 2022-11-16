
const getProcessId = require('../operations/get-process-id.js')

const SheetsHandler = require('../utils/sheets.js')
const IterationsHandler = require('../operations/iterations-handler.js')
const MembersHandler = require('../operations/members-handler.js')

const getCommand = require('../operations/get-command.js')
const { dsc_start, dsc_walletAddress }= require('../../resources/descriptions.json')

const options = {
    name: 'start',
    description: dsc_start,
    hidden: true,
      okChannelIds: [process.env.VERIFY_CHANNEL_ID],
      redirectToChannel: 'verify',
      okRoleIds: null,
      unauthorizedMsg: null,
      arguments: [{ name: 'address', description:dsc_walletAddress, type:"string", required: true }],
      shHandler: SheetsHandler,
      teamCommand: false,
  }
const next = async function (prc) {
  const mbrsHandler = new MembersHandler(prc.shHandler)
  const membersData = await mbrsHandler.getMembersData()
  if (!membersData) {
    return await prc.replier.end('fail')
  }
  var mbr = {}
  mbr.wallet_address = prc.arg.address
  mbr.discord_id = prc.interaction.user.id
  mbr.id = mbr.discord_id + '_' + mbr.wallet_address

  const idx = membersData.index.indexOf(mbr.id)

  if (idx !== -1) {
    const entry = membersData.entries[idx]
    if (entry.verified && !entry.unlinked) {
      return await prc.replier.end('allFine')
    }
    return await prc.replier.end('instructions', {process_id:entry.process_id})
  }
  const itHandler = new IterationsHandler(prc.shHandler)
  const iterationsData = await itHandler.prcIterationsData('owner_wallet')
  if (!iterationsData) {
    return await prc.replier.end('fail')
  }
  if (!iterationsData.list.owner_wallet.includes(mbr.wallet_address)) {
    return await prc.replier.end('walletNotFound')
  }

  var ids = mbrsHandler.getAllProcessIds()
  var processData = getProcessId(mbr.discord_id, ids, prc.interaction.client.logger)
  if(processData === false){
    return await prc.replier.end('fail')
  }

  mbr.process_id = processData.id
  mbr.key = processData.key
  mbr.verified = false

  const success = await mbrsHandler.addMember(mbr)
  if (success) {
    return await prc.replier.end('instructions', {process_id:mbr.process_id})
  }
  return await prc.replier.end('fail')
}

module.exports = getCommand(options, next)