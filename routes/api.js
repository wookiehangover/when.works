var request = require('request');
var cache = require('../lib/cacheman');
var formatPostBody = require('../lib/format-api-post');
var urlRoot = 'https://www.googleapis.com/calendar/v3/';

// var Invite = require('../models/invite');

var api = exports;

// api.createInvite = function(req, res) {
//   var user = req.user
//   var params = req.body
//   params.user = user.data.email
//   var invite = new Invite(params)

//   invite.save()
//     .then(function(result) {
//       res.json(201, result)
//     })
//     .catch(function(err) {
//       res.json(500, { error: err })
//     })
// };

api.checkCache = cache.checkCache;

/*
 * GET proxy to Google Calendars list API
 */

api.calendars = function(req, res){
  var user = req.user;

  var params = {
    url: urlRoot +'users/me/calendarList',
    headers: formatAuthHeader(user),
    json: true
  };

  request( params, responseHandler.bind({ res: res, req: req }) );
};

/*
 * GET proxy to Google Calendars freebusy API
 */
api.freebusy = function(req, res){
  var user = req.user;

  if( !req.query.timeMin || !req.query.timeMax || !req.query.calendars ){
    res.json({ error: 'Missing required fields' }, 412);
    return;
  }

  var params = {
    url: urlRoot +'freeBusy',
    headers: formatAuthHeader(user),
    json: formatPostBody(req.query)
  };

  request.post(params, responseHandler.bind({ res: res, req: req }));
};

// Middleware to check that the current user is authenticated
api.requireUser = function(req, res, next){
  var user = req.session.user;
  if(user){
    req.user = user;
    next();
  } else if (req.headers.auth_token) {
    req.client.hgetall('chrome_token:'+ req.headers.auth_token, function(err, user) {
      req.user = user;
      next();
    })
  } else {
    res.json({ error: 'Forbidden'}, 403);
  }
};

// Returns a headers object with the user's oauth token
function formatAuthHeader(user){
  return {
    Authorization: 'Bearer '+ user.token
  };
}

// Callback for request, to be used with .bind(res) to pass the response object
function responseHandler(err, resp, body){
  if( err ){
    console.log(err, body);
    return this.res.error(500);
  }

  if (resp.statusCode === 401) {
    console.log('token expired, refreshing')
    return this.res.redirect('/refresh-token?redirect='+ this.req.url);
  }

  if( body && body.error ){
    return this.res.json(body.error, body.error.code);
  }

  cache.cacheResponse(this.req.client, this.req.url, body);

  this.res.json(body);
}
