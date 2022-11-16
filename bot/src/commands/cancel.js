const requestsCommand = require('../operations/requests-command.js')
const { dsc_cancel }= require('../../resources/descriptions.json')

const then_next = async function (prc) {
  if (!prc.itStatus.discord_id || prc.itStatus.request_cancelled === true) {
    return await prc.replier.end('noActiveRequest')
  }

  if (prc.itStatus.discord_id !== prc.discord_id) {
    return await prc.replier.end('noCancel')
  }

  const success = await prc.itHandler.updateRequest(
    prc.itStatus.request_row,
    prc.discord_id,
    prc.discord_username,
    true
  )
  if (!success) {
    return await prc.replier.end('fail')
  }
  return await prc.replier.end('requestCancelled')
}

module.exports = requestsCommand('cancel', dsc_cancel, then_next)