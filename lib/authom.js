var config = require('config').google;
var authom = module.exports = require('authom');
var randomToken = require('random-token');

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

  if (req.session.chrome) {
    var token = randomToken(16)
    req.client.hmset('chrome_token:'+ token, resp.data, function(err) {
      if (err) {
        return res.send(500);
      }
      res.redirect(req.session.chrome + '#token='+ token);
    });
  } else {
    req.session.user = resp;
    res.redirect('/');
  }
});

authom.on('error', function(req, res, data){
  res.json(data);
});


