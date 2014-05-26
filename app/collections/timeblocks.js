define(function(require, exports, module) {

  var _ = require('underscore');
  var Backbone = require('backbone');

  module.exports = Backbone.Collection.extend({

    // Create a single list of free times across all calendars in the
    // collection
    //
    // [
    //   [[meetingStart, meetingEnd], ...]
    //   ...
    // ]
    //
    reduceTimes: function(calendars) {
      var times = this.reduce(function(mem, model){
        if (_.contains(calendars, model.id)) {
          mem.push(model.get('times'));
        }
        return mem;
      }, []);

      console.log(times)

      var days = this.getTimesByDay(times);

      return _.map(days, function(dayblock) {
        return this.filterDayblock(dayblock.sort(function(a, b) {
          return a[0] - b[0];
        }));
      }, this);
    },

    // Merge timeblocks from all calendars into a single object, keyed by date
    //
    // {
    //   2014-01-01: [timeblocks]
    // }
    getTimesByDay: function(timeblocks){
      return _.reduce(timeblocks, function(days, timeblock){
        _.each(timeblock, function(times, day){
          if (days[day]) {
            days[day].push.apply(days[day], times);
          } else {
            days[day] = times;
          }
        });
        return days;
      }, {});
    },

    // Removes duplicate and overlapping time entries in a pre-merged dayblock,
    // creating a single list of availability for multiple calendars.
    //
    // Assumes that the `dayblock` provided has more than 1 calendar, otherwise
    // this is just an expensive noop.
    //
    // Returns an array of available times:
    //
    // [
    //   [meetingStart, meetingEnd],
    //   ...
    // ]
    filterDayblock: function(dayblock) {
      // Keeps track of merged nodes as to not add an index that's been merged
      var merged = [];
      // Reduce the list of times, merging overlapping nodes
      //
      // Given: [[a, b], [c, d]] where B > C
      //  create a merged entry of the form: [a, (B || D)]
      var mergedList = _.reduce(dayblock, function(block, time, i){
        var next = dayblock[i + 1];
        if (next && time[1].isAfter(next[0])) {
          block.push([
            next[0],
            (next[1].isAfter(time[1]) ? next[1] : time[1] )
          ]);
          merged.push(i + 1);
        } else if (!(i in merged)) {
          block.push(time);
        }
        return block;
      }, []);

      // Walk through the merged list, pruning any meeting slots that are still
      // colliding
      //
      // TODO: this seems like a klude, but it seems to work, soo...
      return _.reject(mergedList, function(time, i){
        var next = mergedList[i + 1];
        return next ? this.detectMeetingCollision(time, next) : false;
      }, this);
    },

    // Helper for improving readability around meeting start/end comparisons
    detectMeetingCollision: function(first, next) {
      if (first[1].isAfter(next[0])) {
        return true;
      }
      if (first[0].isSame(next[0])) {
        return true;
      }
      if (first[1].isSame(next[1])) {
        return true;
      }
      return false;
    }
  });

});
