define(function(require, exports, module) {
  var $ = require('jquery');
  var _ = require('underscore');
  var moment = require('moment');
  var mixins = require('lib/mixins');
  var Backbone = require('backbone');

  module.exports = Backbone.Collection.extend({

    initialize: function(models, params) {
      if (!params.config) {
        throw new Error('You must pass a config model');
      }
      this.config = params.config;

      this.config.on('change:calendar change:timeMax change:timeMin', function(model) {
        if (model.get('timeMax') && model.get('timeMin') && model.get('calendar')) {
          this.fetch(model.get('options') || {});
        }
      }, this);
    },

    url: function() {
      var query = $.param({
        calendar: this.config.get('calendar'),
        timeMin: this.moment(this.config.get('timeMin')).format(),
        // add extra time to account for the range returned by the gCal API
        timeMax: this.moment(this.config.get('timeMax')).add('days', 1).format()
      });

      return '/api/freebusy?' + query;
    },

    parse: function(obj) {
      return obj.calendars[this.config.get('calendar')].busy;
    },

    // Interface for generating and array of availabile times
    getUntaken: function() {
      // Split collection into days of the week
      var days = this.getDays();
      // Get the availability text for each day in the time range
      var timeblock = _.map(days, this.getAvailabilityFromDay, this);


      // You jerk
      if (timeblock.length === 0) {
        timeblock = [
          "You're the jerk that doesn't have anything scheduled.",
          "Good for you."
        ];
      }

      // Flatten nested dayblock arrays into a single array on the way out
      return _.flatten(timeblock);
    },

    // Creates an Object that takes the form
    //
    // {
    //   2013-01-01: [ (Freebusy Model) ]
    // }
    //
    // Ranging from the configured time range
    getDays: function() {
      var format = 'YYYY-MM-DD';

      var events = this.groupBy(function(model) {
        return this.moment(model.get('start')).format(format);
      }, this);

      var allDays = {};
      var weekend = [];
      var start = this.moment(this.config.get('timeMin'));
      var end = this.moment(this.config.get('timeMax'));

      _.times(moment.duration(end - start).days(), function(i) {
        var date = start.clone().add('d', i);
        if (+date.format('d') === 0 || +date.format('d') === 6) {
          weekend.push(date.format(format));
        }
        allDays[date.format(format)] = [];
      });

      if (this.config.get('ignoreWeekend')) {
        allDays = _.omit(allDays, weekend);
        events = _.omit(events, weekend);
      }

      return _.merge(events, allDays);
    },

    // Creates a timestring in the form: "Monday, 1/23 - 4 to 6pm"
    createTimestring: mixins.createTimestring,

    // Returns a Moment object with the correct timezone offset.
    moment: mixins.localMoment,

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

      // if this is an empty day, return early
      if (times.length === 0) {
        dayblock.push(this.createTimestring(dayStart, dayEnd));
        return dayblock;
      }

      // Remove the First and Last time entry from the times array
      var first = times.shift();
      var last = times.pop();
      // Set the start and end times for the first meeting, if it exists
      var firstMeetingStart = first ? this.moment(first.get('start')) : false;
      var firstMeetingEnd = first ? this.moment(first.get('end')) : false;
      // The next available meeting time is always the end of the first meeting
      var nextAvailableStart = firstMeetingEnd;

      // If anything is on the calendar for that day and there's any free time
      // before it, add it to the dayblock
      if (firstMeetingStart &&
        firstMeetingStart !== dayStart &&
        firstMeetingStart.isAfter(dayStart)) {
        dayblock.push(this.createTimestring(dayStart, firstMeetingStart));
      }

      // If you have an all day event scheduled, it usually ends *after* the
      // end of the current day
      if (firstMeetingStart &&
        firstMeetingEnd.isAfter(dayEnd) && times.length === 0) {

        if (this.config.get('showUnavailable')) {
          // Make things look sane by always conforming to the start time
          if (firstMeetingStart.isBefore(dayStart)) {
            firstMeetingStart = dayStart;
          }
          dayblock.push([
            firstMeetingStart.format('dddd M/D'),
            '- No availability after',
            firstMeetingStart.format('hh:a')
          ].join(' '));
          return dayblock;
        } else {
          return []; // This will disappear into nothing when _.flatten'ed
        }

      }

      // Iterate through the "middle" times and add timestrings for the time
      // between the meetings
      _.each(times, function(timeEntry) {
        // Handle empty start times
        if (!nextAvailableStart) {
          return;
        }
        // Create a timestring (Monday 1/1 1 - 2pm) and add it to the list
        var meetingEnd = this.moment(timeEntry.get('start'));
        var timestring = this.createTimestring(nextAvailableStart, meetingEnd);
        dayblock.push(timestring);
        // Set the next availability period's start time
        nextAvailableStart = this.moment(timeEntry.get('end'));
      }, this);

      // Set the start and end times for the last meeting, if it exists
      var lastMeetingStart = last ? this.moment(last.get('start')) : false;
      var lastMeetingEnd = last ? this.moment(last.get('end')) : false;

      // If there were meetings today, *and* a last meeting of the day, create
      // a timestring
      if (nextAvailableStart && lastMeetingStart) {
        dayblock.push(
        this.createTimestring(nextAvailableStart, lastMeetingStart)
        );

        // If the end of the last meeting is before the end of the day, create
        // a timestring
        if (lastMeetingEnd.isBefore(dayEnd)) {
          dayblock.push(this.createTimestring(lastMeetingEnd, dayEnd));
        }
      }

      // And if there's no last meeting, create a timestring from the end of
      // the last timeslot to the dayblock
      if (!lastMeetingStart) {
        dayblock.push(this.createTimestring(nextAvailableStart, dayEnd));
      }

      return dayblock;
    }
  });
});

