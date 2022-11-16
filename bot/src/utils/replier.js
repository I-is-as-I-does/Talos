module.exports = class Replier {
  constructor(interaction, TextsHandler) {
    this.interaction = interaction
    this.txt = TextsHandler
  }

  async start(hidden = true) {
    var opts = {}
    if (hidden) {
      opts.ephemeral = true
    }
    return await this.interaction.deferReply(opts)
  }

  async edit(key, replace = null) {
    return await this.interaction.editReply({ content: this.txt.gettxt(key, replace) })
  }

  async followUp(key, replace = null) {
    return await this.interaction.followUp(this.txt.gettxt(key, replace))
  }

  async close() {
    if (this.interaction.client.logger.store.length) {
      return await this.interaction.client.logger.send()
    }
    return
  }

  async end(key, replace = null) {
    this.close()
    return await this.edit(key, replace)
  }
}
