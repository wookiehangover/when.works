define(function(require, exports, module){
  var $ = require('jquery');
  var _ = require('underscore');
  var moment = require('moment');
  var Backbone = require('backbone');

  var START_TIME = '10';
  var END_TIME   = '18';

  module.exports = Backbone.Collection.extend({
    url: function(){

      var query = $.param({
        calendar: this.config.get('calendar'),
        timeMin: this.moment( this.config.get('timeMin') ).format(),
        // add extra time to account for the range returned by the gCal API
        timeMax: this.moment( this.config.get('timeMax') ).add('days', 1).format()
      });

      return '/untaken?'+ query;
    },

    initialize: function(params){
      this.config = params.config;

      this.config.on('change', function(model){
        if( model.get('timeMax') && model.get('timeMin') && model.get('calendar') ){
          this.fetch();
        }
      }, this);
    },

    parse: function( obj ){
      return obj.calendars[ this.config.get('calendar') ].busy;
    },

    // Returns the availability based on all of the current models
    getUntaken: function(){
      var days = this.getDays();

      var timeblock = _.map(days, this.getAvailabilityFromDay, this);

      if( timeblock.length === 0 ){
        timeblock = ["You're the jerk that doesn't have anything scheduled.", "Good for you."];
      }

      return _.flatten(timeblock);
    },

    // Groups the models by day
    getDays: function(){
      return this.groupBy(function( model ){
        return this.moment( model.get('start') ).format('YYYY-MM-DD');
      }, this);
    },

    // Creates a timestring in the form: "Monday, 1/23 - 4 to 6pm"
    createTimestring: function(beginning, ending){
      // Make sure that am/pm suffixes are only applied when they differ
      // between start and end times
      var beginningFormat = beginning.minutes() === 0 ? 'h' : 'h:mm';
      var endFormat = ending.minutes() === 0 ? 'ha' : 'h:mma';

      if( ending.format('a') !== beginning.format('a') ){
        beginningFormat += 'a';
      }

      // Format that shit
      return beginning.format('dddd M/D - '+ beginningFormat +' to ') + ending.format(endFormat);
    },

    // Returns a Moment object with the correct timezone offset.
    moment: function(date){
      var m = moment(date);
      var local = moment().zone();
      var timezone = this.config.get('timezone');
      var offset, dst;

      if( timezone ){
        timezone = timezone.split(',');
        dst = parseInt( timezone[1], 10 );
        offset = Math.abs( parseInt(timezone[0], 10) );

        if( moment().isDST() && dst === 1 ){
          offset -= 60;
        }

        if( offset !== local ){
          m.subtract('minutes', offset - local);
        }
      }

      return m;
    },

    // Takes an array of Models for a given date and determines the availabilty
    //
    //  times - an array of Models with start and end times
    //  date  - the current date
    //
    // returns an array of available times
    getAvailabilityFromDay: function(times, date){
      var dayblock = [];

      // Set the Beginning and the End of the current day
      var dayStart = this.moment( moment(date).hour(START_TIME) );
      var dayEnd   = this.moment( moment(date).hour(END_TIME) );

      // Remove the First and Last time entry from the times array
      var first = times.shift();
      var last  = times.pop();

      // Set the start and end times for the first meeting, if it exists
      var firstMeetingStart = first ? this.moment( first.get('start') ).local(): false;
      var firstMeetingEnd = first ? this.moment( first.get('end') ).local(): false;

      // The next available meeting time is always the end of the first meeting
      var nextAvailable = firstMeetingEnd;

      // If anything is on the calendar for that day and there's any free time
      // before it, add it to the dayblock
      if( firstMeetingStart && firstMeetingStart !== dayStart ){
        dayblock.push( this.createTimestring(dayStart, firstMeetingStart) );
      }

      // Iterate through the "middle" times and add timestrings for the time
      // between the meetings
      _.each(times, function(timeEntry){
        if( nextAvailable ){
          dayblock.push( this.createTimestring(nextAvailable, this.moment( timeEntry.get('start') ).local()) );
          nextAvailable = this.moment(timeEntry.get('end')).local();
        }
      }, this);

      // Set the start and end times for the last meeting, if it exists
      var lastMeetingStart = last ? this.moment( last.get('start') ).local() : false;
      var lastMeetingEnd   = last ? this.moment( last.get('end') ).local() : false;

      // If there were meetings today, *and* a last meeting of the day, create
      // a timestring
      if( nextAvailable && lastMeetingStart ){
        dayblock.push( this.createTimestring(nextAvailable, lastMeetingStart) );

        // If the end of the last meeting is before the end of the day, create
        // a timestring
        if( lastMeetingEnd.hours() < dayEnd.hours() ){
          dayblock.push( this.createTimestring(lastMeetingEnd, dayEnd) );
        }
      }

      // And if there's no last meeting, create a timestring from the end of
      // the last timeslot to the dayblock
      if( !lastMeetingStart ){
        dayblock.push( this.createTimestring(nextAvailable, dayEnd) );
      }

      return dayblock;
    }

  });
});

