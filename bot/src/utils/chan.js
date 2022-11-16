module.exports = class ChannelResolver {
  constructor(client, channels) {
    this.client = client
    this.channels = channels
  }
  getChan(chanKey) {
    if (Object.prototype.hasOwnProperty.call(this.channels, chanKey)) {
      if (this.channels[chanKey].name === null) {
        this.channels[chanKey].name = this._resolveName(this.channels[chanKey].id)
      }
      return this.channels[chanKey].name
    }
    this.client.logger.report('warning', 'Unknown channel', [
        { name: 'channel_key', value: chanKey },
      ])
    return ''
  }
  _resolveName(channelId) {
    if (channelId) {
      const channel = this.client.channels.cache.get(channelId)
      if (channel) {
        return channel.name
      }
    }
    this.client.logger.report('warning', 'Unable to find channel', [
      { name: 'channel_id', value: channelId },
    ])
    return ''
  }
}
