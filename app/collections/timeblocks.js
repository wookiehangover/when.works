define(function(require, exports, module) {

  var _ = require('underscore');
  var Backbone = require('backbone');

  module.exports = Backbone.Collection.extend({

    getAllTimes: function(){
      return this.reduce(function(res, model){
        _.each(model.get('times'), function(times, day){
          if (res[day]) {
            res[day].concat(times);
          } else {
            res[day] = [].concat(times);
          }
        });
        return res;
      }, {});
    },

    reduceTimes: function() {
      var times = this.getAllTimes();

      return _.map(times, function(day){
        var dayblock = [];

        var startTimes = [];
        var endTimes = [];
        _.each(day, function(meeting){
          startTimes.push(meeting[0]);
          endTimes.push(meeting[1]);
        });
        startTimes.sort();
        endTimes.sort();

        startTimes = _.uniq(startTimes, true);
        endTimes = _.uniq(endTimes, true);

        // startTimes [9, 10, 11]
        // endTimes [10:30, 11, 11:30]
        //
        // => [[9,10:30],[11,11:30]]

        // var first = startTimes.shift();
        // var last = endTimes.pop();

        var blacklist = [];

        var rejectIfNextMeetingIsBeforeMeetingEnd = function(startTime, endTime){
          return startTime.isBefore(endTime) || startTime.isSame(endTime);
        };

        _.each(startTimes, function(start, i){
          var next = startTimes[i + 1];
          var end = endTimes[i];
          if (next && end && rejectIfNextMeetingIsBeforeMeetingEnd(next, end)){
            blacklist.push(next);
          }
        });

        startTimes = _.reject(startTimes, function(time){
          return (time in blacklist);
        });

        return dayblock;
      });
    }
  });

});
