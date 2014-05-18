define(function(require, exports, module) {
  var _ = require('underscore');
  var moment = require('moment');

  exports.localMoment = function(date) {
    var m = moment(date);
    var local = moment().zone();
    var timezone = this.config.get('timezone');
    var offset, dst;

    if (timezone) {
      timezone = timezone.split(',');
      dst = parseInt(timezone[1], 10);
      offset = Math.abs(parseInt(timezone[0], 10));

      if (moment().isDST() && dst === 1) {
        offset -= 60;
      }

      if (offset !== local) {
        m.subtract('minutes', offset - local);
      }
    }
    return m;
  };

  // Creates a timestring in the form: "Monday, 1/23 - 4 to 6pm"
  exports.createTimestring = function(start, end) {
    if (_.isArray(start)) {
      params = start;
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



});
