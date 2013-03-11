define(function(require, exports, module){
  var $ = require('jquery');
  var moment = require('moment');
  var Backbone = require('backbone');

  var START_TIME = '10';
  var END_TIME   = '18';

  module.exports = Backbone.Collection.extend({
    url: function(){

      var query = $.param({
        calendar: this.config.get('calendar'),
        timeMin: moment( this.config.get('timeMin') ).format(),
        // add extra time to account for the range returned by the gCal API
        timeMax: moment( this.config.get('timeMax') ).add('days', 1).format()
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

    // Google only returns your "busy" times, so we need to transform those
    // into your available times, in the format:
    //
    //    * Monday, 1/23 - 4 to 6pm
    //    * Tuesday, 1/24 - 11am to 1pm
    //
    // returns an array of timestrings
    getUntaken: function(){
      var timeblock = this.map(function(model, i, list){
        // Convert the start and end times in the model to local moment objects
        var start = moment( model.get('start') ).local();
        var end   = moment( model.get('end') ).local();
        var next, nextEnd;

        // If there are more model left, look ahead to the next model
        if( i + 1 === this.length ){
          next = end;
        } else {
          next  = moment( this.at(i + 1).get('start') ).local();
          nextEnd = moment( this.at(i + 1).get('end') ).local();
        }

        // Set the default starting time
        // TODO: this should be configurable
        var dayStart = moment( model.get('start') ).startOf('day').add('hours', START_TIME);

        // Begin availbaility block with the start of the day if possible,
        // other wise start with the end of the current meeting
        var beginning = start.hour() - dayStart.hour() < 0 ? dayStart : end;

        // The end of the current available time block is either the start of
        // the next "busy" time or the end of the current day
        var ending = next.date() === beginning.date() ?
          next : start.startOf('day').add('hours', END_TIME);

        // If the beginning and the ending happen to be *exactly* equal (this
        // happens, confusingly enough,) make sure the time block ends at the
        // end of the current day
        if( beginning === ending ){
          ending = start.startOf('day').add('hours', END_TIME);
        }

        // Make sure that am/pm suffixes are only applied when they differ
        // between start and end times
        var beginningFormat = beginning.minutes() === 0 ? 'h' : 'h:mm';
        var endFormat = ending.minutes() === 0 ? 'ha' : 'h:mma';

        if( ending.format('a') !== beginning.format('a') ){
          beginningFormat += 'a';
        }

        // Format a timestring in the form: "Monday, 1/23 - 4 to 6pm"
        var timestring = beginning.format('dddd M/D - '+ beginningFormat +' to ') + ending.format(endFormat);
        return timestring;
      }, this);

      if( timeblock.length === 0 ){
        timeblock = ["You're the jerk that doesn't have anything scheduled.", "Good for you."];
      }

      return timeblock;
    }
  });
});

