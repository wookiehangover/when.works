var _ = require('lodash')
var moment = require('moment')

// Returns a merged array of overlapping times
var mergeSort = function(times) {
  var sortedTimes = _.clone(times).sort(function(a, b) {
    var aStart = moment(a.start)
    var bStart = moment(b.start)

    if (aStart.isSame(bStart)) {
      return moment(a.end) - moment(b.end)
    } else {
      return aStart - bStart
    }
  })

  var mergedTimes = [];
  mergedTimes.push(sortedTimes.shift())
  _.each(sortedTimes, function(interval){
    var last = _.last(mergedTimes)

    if (moment(interval.start).isAfter(moment(last.end))) {
      return mergedTimes.push(interval)
    }

    if (moment(interval.end).isAfter(moment(last.end))) {
      last.end = interval.end
    }
  });

  return mergedTimes
}

module.exports = mergeSort
