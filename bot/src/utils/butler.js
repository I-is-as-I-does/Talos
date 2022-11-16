module.exports = {
  clearMessages: async function (interaction, number = 100) {
    if (number > 100) {
      number = 100
    }
    const channel = interaction.channel
    const messageManager = channel.messages
    const messages = await messageManager.channel.messages.fetch({ limit: number })
    const deletable = messages.filter(msg => !msg.pinned)
    return await channel.bulkDelete(deletable, true)
  },

  getUserName:function(interaction, userId, fallback =null){
    const member = interaction.guild.members.cache.get(userId)
    if(member){        
      return member.user.username+'#'+member.user.discriminator 
    }
    return fallback
  },
  checkRole: function(interaction, userId, roleIds){
    var found = false
    try {
        const member = interaction.guild.members.cache.get(userId)
          for(var i=0; i<roleIds.length; i++){
            if (member.roles.cache.some(role => role.id === roleIds[i])) {
              found = true
              break
          }
          }
       
      } catch (e) {
        interaction.client.logger.report(
          'warning',
          'Unable to check role',[
            { name: 'userId', value: userId }, { name: 'roleIds', value: roleIds.join(', ') }
          ]
        )
       
      }
      return found
  },
  addRole: function (interaction, userId, roleId) {
    try {
      const role = interaction.guild.roles.cache.get(roleId)
      const member = interaction.guild.members.cache.get(userId)
      member.roles.add(role)
      return true
    } catch (e) {
      interaction.client.logger.report(
        'warning',
        'Unable to attribute role.',[
          { name: 'userId', value: userId }, { name: 'roleId', value: roleId }
        ]
      )
      return false
    }
  },
}
