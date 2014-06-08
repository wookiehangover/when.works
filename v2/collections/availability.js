var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backdash');
var mixins = require('../lib/mixins');
var Timeblocks = require('./timeblocks');
var moment = require('moment-timezone')
var tzData = require('../lib/timezone-data');

module.exports = Backbone.Collection.extend({

  DATE_FORMAT: 'YYYY-MM-DD',

  constructor: function() {
    this.timeblocks = new Timeblocks();
    return Backbone.Collection.apply(this, arguments);
  },

  initialize: function(models, params) {
    if (!params.config) {
      throw new Error('You must pass a config model');
    }
    this.config = params.config;

    this.once('sync', function(){
      this.loaded = true;
    }, this);

    this.config.on('change:calendars change:timeMax change:timeMin', function(model) {
      if (model.get('timeMax') && model.get('timeMin') && model.get('calendars')) {
        console.log(model.get('calendars'))
        this.fetch(model.get('options') || {});
      }
    }, this);
  },

  url: function() {
    var query = $.param({
      calendars: this.config.get('calendars'),
      timeMin: this.moment(this.config.get('timeMin')).format(),
      // add extra time to account for the range returned by the gCal API
      timeMax: this.moment(this.config.get('timeMax')).add('days', 1).format()
    });

    return '/api/freebusy?' + query;
  },

  parse: function(obj) {
    return _.map(obj.calendars, function(data, name){
      return { id: name, freebusy: data.busy };
    });
  },

  // Removes any free time that is shorter than the minimum meeting duration
  pruneShortMeetings: function(dayblocks) {
    var minDuration = parseInt(this.config.get('minDuration'), 10);

    return _.map(dayblocks, function(times){
      return _.reject(times, function(time){
        return (moment.duration(time[1] - time[0]).as('minutes') < minDuration);
      });
    });
  },

  // Returns a presented dayblock in the form ['Monday 6/66, 1 -2pm', ...]
  presentDayblocks: function(dayblocks) {
    return _.map(_.flatten(this.pruneShortMeetings(dayblocks), true), this.createTimestring);
  },

  // Interface for generating and array of availabile times
  getUntaken: function() {
    if (this.length === 0) {
      return [];
    }
    var calendars = this.config.get('calendars');

    _.each(calendars, function(id){
      var days = this.getDays(this.config.get('calendars')[0]);
      // Get the availability text for each day in the time range
      var dayblocks = _.map(days, this.getAvailabilityFromDay, this);

      // Cache the munged availability data in the timeblocks collection
      this.timeblocks.add({
        id: id,
        times: _.zipObject(_.keys(days), dayblocks),
        timeblock: this.presentDayblocks(dayblocks)
      }, { merge: true });
    }, this);

    var timeblock;

    if (calendars.length === 1){
      timeblock = this.timeblocks.get(calendars[0]).get('timeblock');
    } else {
      timeblock = this.presentDayblocks(
        this.timeblocks.reduceTimes(calendars)
      );
    }

    // You jerk
    if (timeblock.length === 0) {
      timeblock = [
        "You're completely free!", "Good for you."
      ];
    }

    return timeblock;
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
      return this.moment(meeting.start).format(this.DATE_FORMAT);
    }, this);

    var allDays = {};
    var weekend = [];
    var start = this.moment(this.config.get('timeMin'));
    var end = this.moment(this.config.get('timeMax'));

    _.times(moment.duration(end - start).days(), function(i) {
      var date = start.clone().add('d', i);
      var dayIndex = +date.format('d');
      var dateKey = date.format(this.DATE_FORMAT);
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

    function addToDayblock(start, end) {
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

    if (firstMeetingEnd && firstMeetingEnd.isBefore(dayStart)) {
      nextAvailableStart = dayStart;
    }

    // Iterate through the "middle" times and add timestrings for the time
    // between the meetings
    _.each(times, function(timeEntry) {
      var meetingEnd = this.moment(timeEntry.start);
      // Handle empty start times, and same start & end times
      if (!nextAvailableStart || meetingEnd.isSame(nextAvailableStart)) {
        return;
      }

      // Create a timestring (Monday 1/1 1 - 2pm) and add it to the list
      addToDayblock(nextAvailableStart, meetingEnd);
      // Set the next availability period's start time
      nextAvailableStart = this.moment(timeEntry.end);
    }, this);


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
