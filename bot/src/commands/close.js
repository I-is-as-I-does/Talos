
const SheetsHandler = require('../utils/sheets.js')
const IterationsHandler = require('../operations/iterations-handler.js')

const getCommand = require('../operations/get-command.js')
const { dsc_close, dsc_requestId }= require('../../resources/descriptions.json')

const options = {
    name: 'close',
    description: dsc_close,
    hidden: false,
    okChannelIds: [process.env.OFFICE_CHANNEL_ID],
    redirectToChannel: null,
    okRoleIds: [process.env.ADMIN_ROLE_ID, process.env.REDEEMER_ROLE_ID],
    unauthorizedMsg: null,
    arguments: [{ name: "id", description:dsc_requestId,  type:"string", required:true}],
    shHandler: SheetsHandler,
    teamCommand: true
  }
const next = async function (prc) {
  const itHandler = new IterationsHandler(prc.shHandler)
        const redeemer = prc.interaction.user.id
        const delivery = [prc.arg.id, redeemer, Date.now()]
        const success = await itHandler.addDelivery(delivery)
        if (success) {
          return await prc.replier.end('setRedeemed', {request_id: prc.arg.id})
        }
      
      return await prc.replier.end('adminFail')
}

module.exports = getCommand(options, next)
