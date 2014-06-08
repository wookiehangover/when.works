var _ = require('lodash');
var moment = require('moment-timezone');
var tzData = require('./timezone-data');

moment.tz.add(tzData);

exports.localMoment = function(date) {
  var timezone = this.config.get('timezone');
  return moment(date).tz(timezone);
};

// Creates a timestring in the form: "Monday, 1/23 - 4 to 6pm"
exports.createTimestring = function(start, end) {
  if (_.isArray(start)) {
    var params = start;
    end = params[1];
    start = params[0];
  }
  // Make sure that am/pm suffixes are only applied when they differ
  // between start and end times
  var startFormat = start.minutes() === 0 ? 'h' : 'h:mm';
  var endFormat = end.minutes() === 0 ? 'ha' : 'h:mma';

  if (end.format('a') !== start.format('a')) {
    startFormat += 'a';
  }

  // Format that shit
  return start.format('dddd M/D, ' + startFormat + ' - ') + end.format(endFormat);
};
