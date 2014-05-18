define(function(require, exports, module) {

  var _ = require('underscore');
  var Backbone = require('backbone');

  module.exports = Backbone.Collection.extend({

    getTimesByDay: function(){
      var timeblocks = this.pluck('times');
      var days = {};

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

    filterDayblock: function(dayblock) {
      var merged = [];
      var mergedList = [];

      _.each(dayblock, function(time, i){
        var next = dayblock[i + 1];
        if (next && time[1].isAfter(next[0])) {
          mergedList.push([
            next[0],
            (next[1].isAfter(time[1]) ? next[1] : time[1] )
          ]);
          merged.push(i + 1);
        } else if (!(i in merged)) {
          mergedList.push(time);
        }
      });

      return _.reject(mergedList, function(time, i){
        var next = mergedList[i + 1];
        if (next) {
          return this.detectMeetingCollision(time, next);
        } else {
          return false;
        }
      }, this);
    },

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
    },

    reduceTimes: function() {
      var days = this.getTimesByDay();

      return _.map(days, function(dayblock) {
        dayblock = dayblock.sort(function(a, b) {
          return a[0] - b[0];
        });

        return this.filterDayblock(dayblock);
      }, this);
    }
  });

});
