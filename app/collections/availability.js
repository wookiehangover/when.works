var _ = require('lodash')
var Backbone = require('backdash')
var moment = require('moment-timezone')
var mergeSort = require('../lib/moment-merge-sort')
var deps = require('ampersand-dependency-mixin');
var qs = require('querystring');
var helper = require('../lib/availability');

var DATE_FORMAT = 'YYYY-MM-DD';

var BASE_URL = process.env.BASE_URL || '';


var Availability = Backbone.Collection.extend({

  prefix: 'dddd M/D, ',

  dependencies: {
    config: 'config model',
    calendars: 'calendars collection'
  },

  constructor: function(models, params) {
    this.attachDeps(params)
    Backbone.Collection.apply(this, arguments);
  },

  initialize: function() {
    this.listenTo(
      this.config,
      'change:calendars change:timeMax change:timeMin',
      _.debounce(this.reload.bind(this), 200)
    );
  },

  url: function() {
    var min = this.moment(this.config.get('timeMin')).format();
    // This stupid addition is because the time you'll get from the use is
    // local and the server wants z time
    var max = this.moment(this.config.get('timeMax')).add(1, 'days').format();

    var query = qs.stringify({
      calendars: this.config.get('calendars'),
      timeMin: min,
      timeMax: max
    });

    return BASE_URL + '/api/freebusy?' + query;
  },

  parse: function(obj) {
    return _.map(obj.calendars, function(data, name){
      return { id: name, freebusy: data.busy };
    });
  },

  reload: function(model) {
    if (model.get('timeMax') && model.get('timeMin') && model.get('calendars') && this.config.get('calendars').length > 0) {
      this.calendars.load.then(this.fetch.bind(this));
    }
  },

  // Removes any free time that is shorter than the minimum meeting duration
  pruneShortMeetings: function(dayblocks) {
    var minDuration = parseInt(this.config.get('minDuration'), 10);
    var max = this.moment(this.config.get('timeMax'));

    return _.map(dayblocks, function(times){
      return _.reject(times, function(time){
        // Fix edge cases where you'll get an out of range event because
        // z time. This is just the best place to throw out the result.
        if (time[1].isAfter(max)) {
          return true;
        }

        return (moment.duration(time[1] - time[0]).as('minutes') < minDuration);
      });
    });
  },

  // Returns a presented dayblock in the form ['Monday 6/66, 1 -2pm', ...]
  presentDayblocks: function(dayblocks) {
    return _.map(dayblocks, this.createTimestring, this);
  },

  presentCalendar: function(dayblocks) {
    // {
    //   '10am': [Mon, Tues, Wed, Thurs, Fri],
    //   '10:30am': [Mon, Tues, Wed, Thurs, Fri],
    // }

    var intervals = [
      '10am', '10:30am',
      '11am', '11:30am',
      '12pm', '12:30pm',
      '1pm', '1:30pm',
      '2pm', '2:30pm',
      '3pm', '3:30pm',
      '4pm', '4:30pm',
      '5pm', '5:30pm'
    ]

    var days = [];

    var rows = _.map(intervals, function(t) {
      if (/:00/.test(t) === false) {
        t = t.replace(/(am|pm)/, ":00$1")
      }

      var fmt = 'YYYY-MM-DD h:mma';

      return _.values(_.reduce(dayblocks, function(result, dayblock) {
        var day = dayblock[0].format('ddd M/D');
        var time = moment(dayblock[0].format('YYYY-MM-DD') + ' ' + t, fmt);
        days.push(day);

        var afterStart = time.isSame(dayblock[0]) || time.isAfter(dayblock[0]);

        if (afterStart && time.isBefore(dayblock[1])) {
          result[day] = {
            booked: false,
            time: time
          };
          // (res[day] !== false)
        } else if (!result[day]) {
          result[day] = {
            booked: true,
            time: time
          }
        }
        return result;
      }, {}));
    });

    return {
      intervals: intervals,
      rows: rows,
      days: _.unique(days)
    }

  },

  getDayblocks: function(cals) {
    if (this.length === 0) {
      return [];
    }
    var days, dayblocks;
    var calendars = _.clone(cals);

    if (this.get('blacklist')) {
      calendars.push('blacklist')
    }

    var config = this.config.pick('timezone', 'start', 'end');

    if (calendars.length === 1) {
      days = this.getDays(calendars[0]);
      dayblocks = _.map(days, function(times, date) {
        return helper.getAvailabilityFromDay(config, times, date);
      }, this);
    } else {
      // Multiple calendars need to be mergeSorted before building the
      // availability list
      days = this.getAllDays(calendars);
      dayblocks = _.map(days, function(times, date){
        if (times.length === 0) {
          return [];
        }
        var timeblock = mergeSort(times);
        return helper.getAvailabilityFromDay(config, timeblock, date);
      }, this);
    }

    return _.flatten(this.pruneShortMeetings(dayblocks), true);
  },

  // Interface for generating and array of availabile times
  getAvailableTimes: function(blacklist) {
    if (this.length === 0) {
      return [];
    }

    var dayblocks = this.getDayblocks(this.config.get('calendars'));
    var timeblock = this.presentDayblocks(dayblocks);

    // You jerk
    if (timeblock.length === 0) {
      timeblock = [
        "You're completely free!", "Good for you."
      ];
    }

    return _.difference(timeblock, blacklist || []);
  },

  // Merges all calendars into the `getDays` format
  getAllDays: function(calendars) {
    return _.reduce(calendars, function(result, id) {
      return _.merge(result, this.getDays(id), function(a, b) {
        return _.isArray(a) ? a.concat(b) : undefined;
      })
    }, {}, this);
  },

  // Creates an Object that takes the form
  //
  // {
  //   2013-01-01: [ (Freebusy Model) ]
  // }
  //
  // Ranging from the configured time range
  getDays: function(id) {
    var model = this.get(id);
    var events = _.groupBy(model.get('freebusy'), function(meeting) {
      return this.moment(meeting.start).format(DATE_FORMAT);
    }, this);

    var allDays = {};
    var weekend = [];
    var start = this.moment(this.config.get('timeMin'));
    var end = this.moment(this.config.get('timeMax'));

    _.times(moment.duration(end - start).days(), function(i) {
      var date = start.clone().add(i, 'd');
      var dayIndex = +date.format('d');
      var dateKey = date.format(DATE_FORMAT);
      if (dayIndex === 0 || dayIndex === 6) {
        weekend.push(dateKey);
      }
      allDays[dateKey] = [];
    }, this);

    if (this.config.get('ignoreWeekend')) {
      allDays = _.omit(allDays, weekend);
      events = _.omit(events, weekend);
    }

    return _.merge(allDays, events);
  },

  // Creates a timestring in the form: "Monday, 1/23 - 4 to 6pm"
  createTimestring: function(start, end) {
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

    var tz = this.config.get('timezone');

    // Format that shit
    return start.tz(tz).format(this.prefix + startFormat + ' - ') + end.tz(tz).format(endFormat);
  },

  // Returns a Moment object with the correct timezone offset.
  moment: function(date) {
    var timezone = this.config.get('timezone');
    return moment(date).tz(timezone);
  }
});

_.extend(Availability.prototype, deps);

module.exports = Availability;
