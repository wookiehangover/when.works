var config = require('config');
var redis = require('redis');
var client = redis.createClient(config.redis.port, config.redis.host);

client.on('error', function(err){
  console.log('Error ' + err);
});

if (config.redis.pass) {
  client.auth(config.redis.pass, function(err){
    if (err) {
      console.log('Error --->')
      return console.log(err)
    }
    console.log('Redis Auth Successful');
  });
}

exports.redis = client;
