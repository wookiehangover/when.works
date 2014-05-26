var config = require('config').google;
var authom = module.exports = require('authom');
var cache = require('../lib/cacheman');

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

authom.on('auth', function(req, res, data){
  if( !req.session ){
    return res.send(500);
  }
  req.session.user = data;
  cache.cacheResponse(req.client, req.url, data);
  res.redirect('/');
});

authom.on('error', function(req, res, data){
  res.json(data);
});


