const http = require('http');

module.exports = {
    stayAwake: function(){
// ping page every 20 minutes to stay awake
setInterval(() => {
	http.get('http://'+process.env.HEROKU_APP_NAME+'.herokuapp.com');
  }, 1200000);
    }
}
