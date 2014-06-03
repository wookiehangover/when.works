var config = require('config').google;
var authom = module.exports = require('authom');

authom.createServer({
  service: 'google',
  id: config.id,
  secret: config.secret,
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://spreadsheets.google.com/feeds'
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

  req.session.user = resp;
  res.redirect('/');
});

authom.on('error', function(req, res, data){
  res.json(data);
});


