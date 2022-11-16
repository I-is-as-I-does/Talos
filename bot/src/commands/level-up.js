const { addRole, getUserName } = require('../utils/butler.js')

const getCommand = require('../operations/get-command.js')
const { dsc_levelUp, dsc_memberId }= require('../../resources/descriptions.json')

const options = {
    name: 'level-up',
    description: dsc_levelUp,
    hidden: false,
      okChannelIds: [process.env.OFFICE_CHANNEL_ID],
      redirectToChannel: null,
      okRoleIds: [process.env.ADMIN_ROLE_ID],
      unauthorizedMsg: null,
      arguments: [{ name: "id",description: dsc_memberId, type:"string", required:true}],
      shHandler: null,
      teamCommand: true
  }
const next = async function (prc) {
  const success = addRole(prc.interaction, prc.arg.id, process.env.COLLECTOR_ROLE_ID)
  if(success){
   const username = getUserName(prc.interaction, prc.arg.id, prc.arg.id)
   return await prc.replier.end('setRoleDone', {username:username})
  } else {
   return await prc.replier.end('setRoleFail')
  }
}

module.exports = getCommand(options, next)

