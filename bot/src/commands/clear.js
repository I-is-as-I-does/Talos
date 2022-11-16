
const { clearMessages } = require('../utils/butler.js')
const wait = require('node:timers/promises').setTimeout
const getCommand = require('../operations/get-command.js')
const { dsc_clear }= require('../../resources/descriptions.json')

const options = {
  name: 'clear',
  description: dsc_clear,
  hidden: false,
  okChannelIds: [process.env.LOG_CHANNEL_ID, process.env.OFFICE_CHANNEL_ID],
  redirectToChannel: null,
  okRoleIds: [process.env.ADMIN_ROLE_ID],
  unauthorizedMsg: null,
  arguments: [],
  shHandler: null,
  teamCommand: true
}

const next = async function (prc) {
  await prc.replier.end('clearing')
      await wait(5000)
      return await clearMessages(prc.interaction)
}

module.exports = getCommand(options, next)