var config = require('config');
var redis = require('redis');
var client = redis.createClient(config.redis.port, config.redis.host);

client.on('error', function(err){
  console.log('Error ' + err);
});

if (config.redis.pass) {
  client.auth(config.redis.pass, function(err){
    console.log('Redis Auth Successful');
  });
}

exports.redis = client;
