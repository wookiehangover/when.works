var $ = require('jquery')
var _ = require('lodash')
var Backbone = require('backdash')
var moment = require('moment-timezone')
var mergeSort = require('../lib/moment-merge-sort')
var mixins = require('../lib/mixins')

var DATE_FORMAT = 'YYYY-MM-DD';

module.exports = Backbone.Collection.extend({

  dependencies: {
    config: 'config model',
    calendars: 'calendars collection'
  },

  initialize: function(models, params) {
    mixins.attachDependencies.call(this, params)
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
    var max = this.moment(this.config.get('timeMax')).add('days', 1).format();

    var query = $.param({
      calendars: this.config.get('calendars'),
      timeMin: min,
      timeMax: max
    });

    return '/api/freebusy?' + query;
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
    return _.map(dayblocks, this.createTimestring);
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

    if (calendars.length === 1) {
      days = this.getDays(calendars[0]);
      dayblocks = _.map(days, this.getAvailabilityFromDay, this);
    } else {
      // Multiple calendars need to be mergeSorted before building the
      // availability list
      days = this.getAllDays(calendars);
      dayblocks = _.map(days, function(times, date){
        if (times.length === 0) {
          return [];
        }
        var timeblock = mergeSort(times);
        return this.getAvailabilityFromDay(timeblock, date);
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
      var date = start.clone().add('d', i);
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

    // Format that shit
    return start.format('dddd M/D, ' + startFormat + ' - ') + end.format(endFormat);
  },

  // Returns a Moment object with the correct timezone offset.
  moment: function(date) {
    var timezone = this.config.get('timezone');
    return moment(date).tz(timezone);
  },

  // Takes an array of Models for a given date and determines the availabilty
  //
  //  times - an array of Models with start and end times
  //  date  - the current date
  //
  // returns an array of available times
  getAvailabilityFromDay: function(times, date) {
    var dayblock = [];
    // Set the beginning and end of the Day from the user settings
    var startTime = moment(this.config.get('start'), 'hha').hours();
    var endTime = moment(this.config.get('end'), 'hha').hours();
    // Set the Beginning and the End of the current day
    var dayStart = this.moment(moment(date).hour(startTime));
    var dayEnd = this.moment(moment(date).hour(endTime));

    function addToDayblock(start, end) {
      // Guard against meeting times outside of your desired time range
      if (start.isBefore(dayStart)) {
        start = dayStart;
      }

      if (end.isAfter(dayEnd)) {
        end = dayEnd;
      }
      dayblock.push([start, end]);
    }

    // if this is an empty day, return early
    if (times.length === 0) {
      addToDayblock(dayStart, dayEnd);
      return dayblock;
    }

    // Remove the First and Last time entry from the times array
    var first = times.shift();
    var last = times.pop();
    // Set the start and end times for the first meeting, if it exists
    var firstMeetingStart = first ? this.moment(first.start) : false;
    var firstMeetingEnd = first ? this.moment(first.end) : false;
    // Set the start and end times for the last meeting, if it exists
    var lastMeetingStart = last ? this.moment(last.start) : false;
    var lastMeetingEnd = last ? this.moment(last.end) : false;
    // The next available meeting time is always the end of the first meeting
    var nextAvailableStart = firstMeetingEnd;

    // If anything is on the calendar for that day and there's any free time
    // before it, add it to the dayblock
    if (firstMeetingStart &&
      firstMeetingStart !== dayStart &&
      firstMeetingStart.isAfter(dayStart)) {
      addToDayblock(dayStart, firstMeetingStart);
    }

    // If you have an all day event scheduled, it usually ends *after* the
    // end of the current day
    if (firstMeetingStart &&
      firstMeetingEnd.isAfter(dayEnd) && times.length === 0) {
      return []; // This will disappear into nothing when _.flatten'ed
    }

    // Iterate through the "middle" times and add timestrings for the time
    // between the meetings
    _.each(times, function(timeEntry) {
      var meetingEnd = this.moment(timeEntry.start);

      // Handle empty start times, and same start & end times
      if (!nextAvailableStart || meetingEnd.isSame(nextAvailableStart)) {
        nextAvailableStart = this.moment(timeEntry.end);
        return;
      }

      if (meetingEnd.isSame(dayStart) || meetingEnd.isBefore(dayStart)) {
        nextAvailableStart = this.moment(timeEntry.end);
        return;
      }

      // Create a timestring (Monday 1/1 1 - 2pm) and add it to the list
      addToDayblock(nextAvailableStart, meetingEnd);
      // Set the next availability period's start time
      nextAvailableStart = this.moment(timeEntry.end);
    }, this);

    if (nextAvailableStart && nextAvailableStart.isSame(dayStart) && _.last(times)) {
      nextAvailableStart = this.moment(_.last(times).end);
    }

    // If there were meetings today, *and* a last meeting of the day, create
    // a timestring
    if (nextAvailableStart && lastMeetingStart) {
      if (!nextAvailableStart.isSame(lastMeetingStart)) {
        addToDayblock(nextAvailableStart, lastMeetingStart);
      }

      // If the end of the last meeting is before the end of the day, create
      // a timestring
      if (lastMeetingEnd.isBefore(dayEnd)) {
        addToDayblock(lastMeetingEnd, dayEnd);
      }
    }

    // And if there's no last meeting, create a timestring from the end of
    // the last timeslot to the dayblock
    if (!lastMeetingStart) {
      addToDayblock(nextAvailableStart, dayEnd);
    }

    return dayblock;
  }
});
