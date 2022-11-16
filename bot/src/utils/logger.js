

module.exports = class BotLogger {
  constructor(client) {
    this.client = client
    this.store = []

    process.on('uncaughtException', (err) => {
      this.report('critical', 'Uncaught Exception', [{ name: 'err', value: err }])
    })

    process.on('unhandledRejection', (reason, promise) => {
      this.report(
        'critical',
        'Unhandled Rejection',
        [
          { name: 'promise', value: promise },
          { name: 'reason', value: reason },
        ]
        
      )
    })
  }

  format(level, title, fields) {
    var content = ['[' + level + '] ' + title]
    fields.forEach((field) => {
      var body = JSON.stringify(field.value, null, 2)
      if (body.length > 240) {
        body = body.substring(0, 240)
      }
      content.push(field.name + ': ' + body)
    })
    content = content.join('\n')
    return content
  }

  report(level, title, fields, consoleOnly = false) {
    var content = this.format(level, title, fields)
    console.log(content)
    if (!consoleOnly) {
      this.store.push(content)
    }
  }

  async send() {
    return await this.client.channels.cache
      .get(process.env.LOG_CHANNEL_ID)
      .send({ content: this.store.join('\n_\n') })
  }
}
