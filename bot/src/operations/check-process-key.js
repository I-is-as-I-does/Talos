const articles = require('../../resources/articles.json')

module.exports = function (discord_id, process_id, key) {
  process_id = process_id.split('#')
  if (process_id.length > 1) {
    discord_id = discord_id.toString().split('')
    key = key.split(':').map((it) => parseInt(it))
    if (key.length === 3) {
      var ok = true
      for (var i = 0; i < 3; i++) {
        if (key[i] >= discord_id.length) {
          ok = false
          break
        }
      }
      if (ok) {
        var a_idx = parseInt(discord_id[key[0]])

        if (articles.length > a_idx) {
          var art = articles[a_idx]
   
          if (process_id[1].length > art.length + 3) {
            var num = discord_id[key[1]] + '' + discord_id[key[2]]
            console.log()
            if (
              process_id[1].substring(0, art.length) === art &&
              process_id[1].slice(-2) === num
            ) {
              return { success: true }
            }
            return { success: false, alert: true }
          }
        }
      }
    }
  }
  return { success: false, alert: false }
}
