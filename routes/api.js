var request = require('request');
var moment = require('moment');

var responseHandler = exports.responseHandler = function(err, resp, body){
  if( err ){
    console.log(err, body);
    return this.error(500);
  }

  this.json( body );
};

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

exports.freebusy = function(req, res){
  var user = req.session.user;

  if( !user ){
    return res.json({ error: 'Forbidden'}, 403);
  }

  var url = 'https://www.googleapis.com/calendar/v3/freeBusy';

  var postBody = {
    timeMin: moment().format(),
    timeMax: moment().add(1, 'week').format(),
    items: [
      {
        id: 'sam@quickleft.com'
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
