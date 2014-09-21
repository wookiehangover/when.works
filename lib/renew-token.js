var request = require('request')
var config = require('config')

module.exports = function(client, user, cb) {
  client.get('token:' + user.data.email, function(err, token){
    if (err) {
      return cb(err)
    }

    if(!token) {
      return cb(new Error('Token not found'))
    }

    var params = {
      url: 'https://accounts.google.com/o/oauth2/token',
      method: 'post',
      form: {
        client_id: config.google.id,
        client_secret: config.google.secret,
        refresh_token: token,
        grant_type: 'refresh_token'
      }
    };

    request(params, function(err, resp, body) {
      if (err) {
        return cb(err);
      }

      var json = parseBody(body);
      if (!json) {
        return cb(err);
      }

      cb(null, json)
    });

  });
}

function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch(e) {
    return false;
  }
}
