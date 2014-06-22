if (process.env.NODETIME_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_KEY,
    appName: 'when.works'
  });
}

var app = require('./whenworks');
var http = require('http');

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
