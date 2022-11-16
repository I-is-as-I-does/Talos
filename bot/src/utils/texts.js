

module.exports = class TextsHandler {
  constructor(client, messages, ChannelResolver, strictMode = false) {
    this.chanRslvr = ChannelResolver
    this.messages = messages
    this.client = client
    this.strictMode = strictMode //@doc if no text found: if true return nothing; else return key
    this.chanRegex = /{{chan.[a-z]+}}/g
  }


  gettxt(key, replace = null) {

    var text = null
    if (Object.prototype.hasOwnProperty.call(this.messages, key)) {
        text = this.messages[key]
        if (replace !== null) {
            text = this.resolveReplace(text, replace)
        }
       
          text = this.resolveChan(text)
        
    } else {
      this.reportMissing(key)
        if (!this.strictMode) {
         text = key
        }
    }
  
    return this.deliver(text)
  }


  reportMissing(key){
    this.client.logger.report('warning', 'Unknown text', [{ name: 'key', value: key }])
  }

  resolveChan(text) {
    var chans = text.match(this.chanRegex)
    if (chans) {
      chans.forEach((chan) => {
        var chankey = chan.slice(2, -2).split('.').pop()
        var rsvl = this.chanRslvr.getChan(chankey)
        text = text.replace(chan, rsvl)
      })
    }
    return text
  }
  resolveReplace(text, replace) {

      for (let [k, v] of Object.entries(replace)) {
        var search = '{{' + k + '}}'
        text = text.replaceAll(search, v)
      }
   
    return text
  }

  deliver(resolved_text){
    if(!resolved_text){
        return '_'//@doc messages can not be empty
    }
    return resolved_text
  }
}
