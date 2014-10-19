var _ = require('lodash');
var moment = require('moment');


// Takes an array of Models for a given date and determines the availabilty
//
//  times - an array of Models with start and end times
//  date  - the current date
//
// returns an array of available times
exports.getAvailabilityFromDay = function(config, times, date) {
  var dayblock = [];
  // Set the beginning and end of the Day from the user settings
  var startTime, endTime;
  if (_.isNumber(config.start)) {
    startTime = config.start;
  } else {
    startTime = moment(config.start, 'hha').hours();
  }

  if (_.isNumber(config.end)) {
    endTime = config.end;
  } else {
    endTime = moment(config.end, 'hha').hours();
  }

  var tzStart = +moment(date).tz(config.timezone).hour(startTime);
  var tzEnd = +moment(date).tz(config.timezone).hour(endTime);
  // Set the Beginning and the End of the current day
  var dayStart = moment(tzStart);
  var dayEnd = moment(tzEnd);


  function addToDayblock(head, tail) {
    // Guard against meeting times outside of your desired time range
    if (head.isBefore(dayStart)) {
      head = dayStart;
    }

    if (tail.isAfter(dayEnd)) {
      tail = dayEnd;
    }
    dayblock.push([head, tail]);
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
  var firstMeetingStart = first ? moment(first.start) : false;
  var firstMeetingEnd = first ? moment(first.end) : false;
  // Set the start and end times for the last meeting, if it exists
  var lastMeetingStart = last ? moment(last.start) : false;
  var lastMeetingEnd = last ? moment(last.end) : false;
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
    var meetingEnd = moment(timeEntry.start);
    // Handle empty start times, and same start & end times
    if (!nextAvailableStart || meetingEnd.isSame(nextAvailableStart)) {
      nextAvailableStart = moment(timeEntry.end);
      return;
    }
    if (meetingEnd.isSame(dayStart) || meetingEnd.isBefore(dayStart)) {
      nextAvailableStart = moment(timeEntry.end);
      return;
    }
    // Create a timestring (Monday 1/1 1 - 2pm) and add it to the list
    addToDayblock(nextAvailableStart, meetingEnd);
    // Set the next availability period's start time
    nextAvailableStart = moment(timeEntry.end);
  });

  if (nextAvailableStart && nextAvailableStart.isSame(dayStart) && _.last(times)) {
    nextAvailableStart = moment(_.last(times).end);
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
};

