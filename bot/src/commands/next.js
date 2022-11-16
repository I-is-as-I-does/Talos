const SheetsHandler = require('../utils/sheets.js')
const IterationsHandler = require('../operations/iterations-handler.js')
const { getUserName } = require('../utils/butler.js')

const getCommand = require('../operations/get-command.js')
const { dsc_next }= require('../../resources/descriptions.json')

const options = {
    name: 'next',
    description: dsc_next,
    hidden: false,
      okChannelIds: [process.env.OFFICE_CHANNEL_ID],
      redirectToChannel: null,
      okRoleIds: [process.env.ADMIN_ROLE_ID, process.env.REDEEMER_ROLE_ID],
      unauthorizedMsg: null,
      arguments: [],
      shHandler: SheetsHandler,
      teamCommand: true,
  }
const next = async function (prc) {
  const itHandler = new IterationsHandler(prc.shHandler)
  const success = await itHandler.updateIterationsData()
  if (success) {
    const pending = await itHandler.getPendingData()
    if (pending) {
      if (!pending.index.length) {
        return await prc.replier.end('noPending')
      }
      const entry = pending.entries[0]
      const collector = getUserName(prc.interaction, entry.discord_id, entry.discord_username)

      await prc.replier.edit('nextPublicInfo', {collector:collector, instance:entry.instance_name, hash:entry.operation_hash, link:entry.link})
      await prc.replier.followUp('nextRedeemerInfo', {request_id: entry.request_id})
      return await prc.replier.close()
    }
  }

return await prc.replier.end('adminFail')
}

module.exports = getCommand(options, next)
