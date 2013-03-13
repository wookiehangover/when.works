var request = require('request');
var moment = require('moment');

var responseHandler = exports.responseHandler = function(err, resp, body){
  if( err ){
    console.log(err, body);
    return this.error(500);
  }

  this.json( body );
};

/*
 * GET proxy to Google Calendars list API
 */

exports.calendars = function(req, res){
  var user = req.session.user;

  if( !user ){
    return res.json({ error: 'Forbidden'}, 403);
  }

  var url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';

  var headers = {
    Authorization: 'Bearer '+ user.token
  };

  var params = {
    url: url,
    headers: headers,
    json: true
  };

  request( params, responseHandler.bind(res) );
};

/*
 * GET proxy to Google Calendars freebusy API
 */
exports.freebusy = function(req, res){
  var user = req.session.user;

  if( !user ){
    return res.json({ error: 'Forbidden'}, 403);
  }

  var url = 'https://www.googleapis.com/calendar/v3/freeBusy';

  if( !req.query.timeMin || !req.query.timeMax || !req.query.calendar ){
    res.json({ error: 'Missing required fields' },412);
    return;
  }

  // Takes the following query parameters:
  //
  //  calendar - `string`
  //  timeMin  - `date` (or anything remotely date-like)
  //  timeMax  - `date`
  var postBody = {
    timeMin: moment( req.query.timeMin ).format(),
    timeMax: moment( req.query.timeMax ).format(),
    items: [
      {
        id: req.query.calendar
      }
    ]
  };

  var headers = {
    Authorization: 'Bearer '+ user.token
  };

  var params = {
    url: url,
    headers: headers,
    json: postBody
  };

  request.post( params, responseHandler.bind(res) );
};
