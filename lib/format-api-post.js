var moment = require('moment');
var _ = require('lodash');

// Takes the following query parameters:
//
//  calendar - `string`
//  timeMin  - `date` (or anything remotely date-like)
//  timeMax  - `date`
module.exports = function( query ) {
  if (_.isArray(query.calendars) === false) {
    query.calendars = [query.calendars];
  }
  var json = {
    timeMin: moment( query.timeMin ).format(),
    timeMax: moment( query.timeMax ).format(),
    items: query.calendars.map(function(cal) {
      return { id: cal };
    })
  };

  return json;
}
