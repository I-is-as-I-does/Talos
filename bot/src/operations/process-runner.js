const { checkRole} = require('../utils/butler.js')
const ChannelResolver = require('../utils/chan.js')
const TextsHandler = require('../utils/texts.js')
const Replier = require('../utils/replier.js')
const messages = require('../../resources/messages.json')

const channels_list= {
  redeem: { id: process.env.REDEEM_CHANNEL_ID, name: null },
  collectors: { id: process.env.COLLECTORS_CHANNEL_ID, name: null },
  help: { id: process.env.HELP_CHANNEL_ID, name: null },
  verify: { id: process.env.VERIFY_CHANNEL_ID, name: null },
  office: { id: process.env.OFFICE_CHANNEL_ID, name: null },
  log: { id: process.env.LOG_CHANNEL_ID, name: null },
}

module.exports = async function runProcess(interaction, opts, next) {

  var prc = {}

  prc.interaction = interaction
  prc.chan = new ChannelResolver(interaction.client, channels_list)
  prc.txt = new TextsHandler(interaction.client, messages, prc.chan, true)
  prc.replier = new Replier(interaction, prc.txt)

  await prc.replier.start(opts.hidden)

  if (opts.okChannelIds.length && !opts.okChannelIds.includes(interaction.channel.id)) {
    if(opts.redirectToChannel){
      return await prc.replier.end('badChannel', {redirect: prc.chan.getChan(opts.redirectToChannel)})
    }
    return await prc.replier.end('unauthorized')
  }

  if (opts.okRoleIds && !checkRole(interaction, interaction.user.id, opts.okRoleIds)) {
    if(opts.unauthorizedMsg !== null){
      return await prc.replier.end(opts.unauthorizedMsg.key, opts.unauthorizedMsg.replace)
    }
    return await prc.replier.end('unauthorized')
  }

  prc.arg = {}
  var missing = []
  if (opts.arguments.length) {
    for (var i = 0; i < opts.arguments.length; i++) {
      var it = opts.arguments[i]
      var v = interaction.options.getString(it.name)
      if (v && it.type === 'string') {
        v = v.trim()
      }
      if (it.required && ['', null, undefined].includes(v)) {
        missing.push(it.name)
      } else {
        prc.arg[it.name] = v
      }
    }
  }
  if(missing.length > 0){
    return await prc.replier.end('isRequired', {list: missing.join(', ')})
  }

  if (opts.shHandler) {

    prc.shHandler = new opts.shHandler(interaction.client.logger)
    const auth = await prc.shHandler.getAuthorized()
    if (!auth) {
      var failk = opts.teamCommand ? 'adminFail' : 'fail'
      return await prc.replier.end(failk)
    }
  }
 
 return await next(prc)
}
