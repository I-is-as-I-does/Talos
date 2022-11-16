const { SlashCommandBuilder } = require('discord.js')
const runProcess = require('./process-runner.js')

const default_opts = {
  name: 'do-nothing',
  description: 'Do nothing.',
  hidden: true,
  okChannelIds: [],
  redirectToChannel: null,
  okRoleIds: null,
  unauthorizedMsg: null,
  arguments: [],
  shHandler: null,
  teamCommand: false
}

module.exports = function getCommand(options, next){

  const opts = Object.assign({}, default_opts, options)

  const builder = new SlashCommandBuilder()
  .setName(opts.name)
  .setDescription(opts.description)
  
  opts.arguments.forEach(argument => {
    if(argument.type === "string"){
      builder.addStringOption((option) =>
    option
      .setName(argument.name)
      .setDescription(
        argument.description
      )
      .setRequired(argument.required)
  )
      }
      //@doc: if need of other type of options, complete this operation.
  })
  
  return {
    data: builder,
    async execute(interaction){
      return await runProcess(interaction, opts, next)
    }
  }
}