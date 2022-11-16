
const articles = require('../../resources/words/articles.json')
const nouns = require('../../resources/words/nouns.json')
const adjectives = require('../../resources/words/adjectives.json')
const { randomInt, randomItem } = require('../utils/general.js')

function gen(prefix, discord_id, attempt){
  var key = []
  for (var i = 0; i < 3; i++) {
    key.push(randomInt(1, discord_id.length) - 1)
  }
  var num = discord_id[key[1]] + '' + discord_id[key[2]]
  var id = [articles[discord_id[key[0]]], randomItem(adjectives), randomItem(nouns), num]
  return { id: prefix + '#' + id.join('-'), key: key.join(':'), attempt: attempt}
}

module.exports = function (discord_id, previous_ids, logger, max_tries = 5) {
  discord_id = discord_id.toString().split('')
  if(!previous_ids){
    return  gen(process.env.PROFILE_ID_PREFIX, discord_id, 1)
  }

  for(var i=0; i< max_tries; i++){
    var data = gen(process.env.PROFILE_ID_PREFIX, discord_id, i+1)
    if (!previous_ids.incudes(data.id)) {
      if(i > 0){
        logger.report('warning', 'Dupes in process ID', {name:"attemps", value:i+1})
      }
     return data
    }
  }
return false
}
