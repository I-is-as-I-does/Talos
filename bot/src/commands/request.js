const requestsCommand = require('../operations/requests-command.js')
const { dsc_request }= require('../../resources/descriptions.json')

const then_next = async function (prc) {
  var success
      if (!prc.itStatus.discord_id) {
        success = await prc.itHandler.addRequest(prc.itStatus.request_id, prc.discord_id, prc.discord_username)
        if (!success) {
          return await prc.replier.end('fail')
        }
        return await prc.replier.end('registered')
      }

      if (prc.itStatus.discord_id === prc.discord_id) {

        if (prc.itStatus.request_cancelled) {
          success = await prc.itHandler.updateRequest(
            prc.itStatus.request_row,
            prc.discord_id,
            prc.discord_username,
            false
          )
          if (!success) {
            return await prc.replier.end('fail')
          }
          return await prc.replier.end('registered')
        }
        return await prc.replier.end('alreadyRegistered')
      }

      if (prc.itStatus.request_cancelled || prc.itStatus.lost_ownership) {
        success = await prc.itHandler.updateRequest(
          prc.itStatus.request_row,
          prc.discord_id,
          prc.discord_username,
          false
        )
        if (!success) {
          return await prc.replier.end('fail')
        }
        return await prc.replier.end('registered')
      }
      return await prc.replier.end('redeemingRequested')
}

module.exports = requestsCommand('request', dsc_request, then_next)