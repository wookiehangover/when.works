var request = require('request');
var moment = require('moment');
var api = exports;

var urlRoot = 'https://www.googleapis.com/calendar/v3/';
/*
 * GET proxy to Google Calendars list API
 */

api.calendars = function(req, res){
  var user = req.session.user;

  if( !user ){
    return res.json({ error: 'Forbidden'}, 403);
  }

  var params = {
    url: urlRoot +'users/me/calendarList',
    headers: formatAuthHeader(user),
    json: true
  };

  request( params, responseHandler.bind(res) );
};

/*
 * GET proxy to Google Calendars freebusy API
 */
api.freebusy = function(req, res){
  var user = req.session.user;

  if( !user ){
    return res.json({ error: 'Forbidden'}, 403);
  }

  if( !req.query.timeMin || !req.query.timeMax || !req.query.calendar ){
    res.json({ error: 'Missing required fields' }, 412);
    return;
  }

  var params = {
    url: urlRoot +'freeBusy',
    headers: formatAuthHeader(user),
    json: formatPostBody(req.query)
  };

  request.post( params, responseHandler.bind(res) );
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
    return this.error(500);
  }

  if( body && body.error ){
    return this.json(body.error, body.error.code);
  }

  this.json( body );
}

// Takes the following query parameters:
//
//  calendar - `string`
//  timeMin  - `date` (or anything remotely date-like)
//  timeMax  - `date`
function formatPostBody( query ){
  return {
    timeMin: moment( query.timeMin ).format(),
    timeMax: moment( query.timeMax ).format(),
    items: [
      {
        id: query.calendar
      }
    ]
  };
}
