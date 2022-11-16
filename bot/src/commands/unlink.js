
const SheetsHandler = require('../utils/sheets.js')
const MembersHandler = require('../operations/members-handler.js')

const getCommand = require('../operations/get-command.js')
const { dsc_unlink, dsc_walletAddress }= require('../../resources/descriptions.json')

const options = {
    name: 'unlink',
    description: dsc_unlink,
    hidden: true,
    okChannelIds: [process.env.VERIFY_CHANNEL_ID],
    redirectToChannel: 'verify',
    okRoleIds: null,
    unauthorizedMsg: null,
    arguments: [{ name: 'address', description: dsc_walletAddress, type:"string", required: true }],
    shHandler: SheetsHandler,
    teamCommand: false,
  }
const next = async function (prc) {
  const mbrsHandler = new MembersHandler(prc.shHandler)
  const membersData = await mbrsHandler.getMembersData()
  if (!membersData) {
    return await prc.replier.end('fail')
  }
  const discord_id = prc.interaction.user.id.toString()

  var found = { member: false, discord: false, wallet: false }
  const props = ['discord', 'wallet']

  for (var i = 0; i < membersData.entries.length; i++) {
    var member = membersData.entries[i]
    var tests = {
      discord: member.discord_id === discord_id,
      wallet: prc.arg.address === member.wallet_address,
    }
    if (tests.wallet && tests.discord) {
      found.member = member
      break
    } else {
      props.forEach((k) => {
        if (!found[k]) {
          found[k] = tests[k]
        }
      })
    }
  }

  if (found.member) {
    if (found.member.unlinked) {
      return await prc.replier.end('unlinked')
    }

    const success = await mbrsHandler.unlinkMember(member.id)
    if (success) {
      return await prc.replier.end('unlinked')
    }
    return await prc.replier.end('fail')
  } else if (found.wallet || found.discord) {
    return await prc.replier.end('badUnlinkMatch')
  } 
    return await prc.replier.end('memberNotFound')

}

module.exports = getCommand(options, next)