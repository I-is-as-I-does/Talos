
const SheetsHandler = require('../utils/sheets.js')
const IterationsHandler = require('../operations/iterations-handler.js')

const getCommand = require('../operations/get-command.js')
const { dsc_update }= require('../../resources/descriptions.json')

const options = {
    name: 'update',
    description: dsc_update,
    hidden: false,
    okChannelIds: [process.env.OFFICE_CHANNEL_ID],
    redirectToChannel: null,
    okRoleIds: [process.env.ADMIN_ROLE_ID, process.env.REDEEMER_ROLE_ID],
    unauthorizedMsg: null,
    arguments: [],
    shHandler: SheetsHandler,
    teamCommand: true
  }
const next = async function (prc) {
  const itHandler = new IterationsHandler(prc.shHandler)
  const success = await itHandler.updateIterationsData()
  if (success) {
    var stats = itHandler.getStats()
    return await prc.replier.end('requestsStats', {stats: stats})

  } 

return await prc.replier.end('adminFail')
}

module.exports = getCommand(options, next)