
const SheetsHandler = require('../utils/sheets.js')
const MembersHandler = require('../operations/members-handler.js')

const { addRole } = require('../utils/butler.js')
const checkProcessKey = require('../operations/check-process-key')

const getCommand = require('../operations/get-command.js')
const { dsc_verify }= require('../../resources/descriptions.json')

const options = {
    name: 'verify',
    description: dsc_verify,
    hidden: true,
      okChannelIds: [process.env.VERIFY_CHANNEL_ID],
      redirectToChannel: 'verify',
      okRoleIds: null,
      unauthorizedMsg: null,
      arguments: [{ name: 'id', description:process.env.PROFILE_ID_PREFIX+'#xxxxxxxxxxxx', type:"string", required: true }],
      shHandler: SheetsHandler,
      teamCommand: false,
  }
const next = async function (prc) {
  if (prc.arg.id.length <process.env.PROFILE_ID_PREFIX.length ||  prc.arg.id.substring(0, process.env.PROFILE_ID_PREFIX.length) !== process.env.PROFILE_ID_PREFIX) {
    return await prc.replier.end('invalidProcessId')
  }


  const mbrsHandler = new MembersHandler(prc.shHandler)
  const membersData = await mbrsHandler.getMembersData()
  if (!membersData) {
    return await prc.replier.end('fail')
  }
  const discord_id = prc.interaction.user.id.toString()

  var found = { member: false, discord: false, process: false }
  const props = ['discord', 'wallet']

  for (var i = 0; i < membersData.entries.length; i++) {
    var member = membersData.entries[i]

    var tests = {
      discord: member.discord_id === discord_id,
      process: prc.arg.id === member.process_id,
    }
    if (tests.process && tests.discord) {
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
    if (found.member.verified) {
      return await prc.replier.end('allFine')
    }

    var check = checkProcessKey(discord_id, prc.arg.id, found.member.key)
    if(!check.success){
      if(check.alert){
        prc.interaction.client.logger.report('alert', 'Suspicious verification attempt', [{name: "discord_id", value:discord_id}, {name:"process_id", value:prc.arg.id} ])
      }
      return await prc.replier.end('invalidProcessId')
    }

    const description = await mbrsHandler.fetchDescription(found.member.wallet_address)
    if (description === false) {
      return await prc.replier.end('fail')
    }
    if (!description || description.indexOf(prc.arg.id) === -1) {
      return await prc.replier.end('idNotFound')
    }
    const success = await mbrsHandler.setVerifiedMember(member.id)
    if (success) {
      addRole(prc.interaction, prc.interaction.user.id, process.env.COLLECTOR_ROLE_ID)
      return await prc.replier.end('verified')
    }
    return await prc.replier.end('fail')
  } else {
    var msgk = 'memberNotFound'
    if (found.process) {
      msgk = 'badDiscordId'
    } else if (found.discord) {
      msgk = 'badProcessId'
    }
    return await prc.replier.end(msgk)
  }
}

module.exports = getCommand(options, next)