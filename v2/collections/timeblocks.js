var _ = require('lodash');
var Backbone = require('backdash');

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
    // var mergedList = _.reduce(dayblock, function(block, time, i){
    //   var next = dayblock[i + 1];
    //   if (next && time[1].isAfter(next[0])) {
    //     block.push([
    //       next[0],
    //       (next[1].isAfter(time[1]) ? next[1] : time[1] )
    //     ]);
    //     merged.push(i + 1);
    //   } else if (!(i in merged)) {
    //     block.push(time);
    //   }
    //   return block;
    // }, []);


    // [ [a, b], [c, d] ]
    //
    // b > c => a - d
    // b < c => a - b

    // push the first interval onto the stack

    dayblock = dayblock.sort(function(a, b){
      if (a[0].isSame(b[0])) {
        return a[1] - b[1]
      } else {
        return a[0] - b[0]
      }
    })

    console.log(dayblock);

    var stack = [];
    stack.push(dayblock.shift());
    _.each(dayblock, function(interval){
      var last = _.last(stack);

      console.log('last', last[0].format(), last[1].format())
      console.log('current', interval[0].format(), interval[1].format())

      if (interval[0].isAfter(last[1])) {
        return stack.push(interval);
      }

      if (interval[0].isBefore(last[1]) && interval[1].isAfter(last[1])) {
        last[1] = interval[1]
      }
    });

    console.log(stack);

    return stack;


    // var mergedList = _.transform(dayblock, function(block, currentTime, i){
    //   var lastTime = _.last(block)|| [];
    //   var nextTime = dayblock[i + 1] || [];

    //   if (lastTime[1]) {
    //     if (currentTime[0].isBefore(lastTime[1]) && currentTime[1].isAfter(lastTime[1])) {
    //       lastTime[1] = currentTime[1];
    //     } else if (currentTime[0].isAfter(lastTime[1])) {
    //       block.push(currentTime);
    //     }
    //   } else if (currentTime[1].isAfter(nextTime[0]) || currentTime[1].isSame(nextTime[0])) {
    //     block.push([currentTime[0], nextTime[1]]);
    //     merged.push(i + 1);
    //   }
    //   else {
    //     block.push(currentTime);
    //   }
    // }, []);

    // Walk through the merged list, pruning any meeting slots that are still
    // colliding
    //
    // TODO: this seems like a klude, but it seems to work, soo...
    // return _.reject(mergedList, function(time, i){
    //   var next = mergedList[i + 1];
    //   return next ? this.detectMeetingCollision(time, next) : false;
    // }, this);
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
