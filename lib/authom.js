var config = require('config').google;
var authom = module.exports = require('authom');
var randomToken = require('random-token');
var User = require('../models/user');
var _ = require('lodash');

authom.createServer({
  service: 'google',
  id: config.id,
  secret: config.secret,
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.readonly'
  ]
});

authom.on('auth', function(req, res, resp){
  if( !req.session ){
    return res.send(500);
  }

  if (resp.refresh_token) {
    req.client.set('token:'+ resp.data.email, resp.refresh_token, function(err){
      if (err) {
        // Oh well
        console.log('Error: '+ err);
      }
    });
  }

  // Special case for authenticating from an extension
  if (req.session.chrome) {
    var token = randomToken(16)
    req.client.hmset('chrome_token:'+ token, resp.data, function(err) {
      if (err) {
        return res.send(500);
      }
      res.redirect(req.session.chrome + '#token='+ token);
    });

  // All other cases
  } else {
    req.session.user = resp;

    var json = _.clone(resp.data);
    json.token = resp.token;


    User.get(json.id).run()
      .then(function(user) {
        _.each(json, function(val, key) {
          user[key] = val;
        });
        return user.save()
      })
      .catch(function(err) {
        if (err.name === 'Document not found') {
          var user = new User(json);
          return user.save()
            .catch(function(err) {
              console.log('ruh roh, failed to save that user')
              console.log(err)
            })
        }
      })
      .finally(function() {
        res.redirect('/');
      })

  }
});

authom.on('error', function(req, res, data){
  res.json(data);
});


