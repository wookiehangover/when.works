var _ = require('lodash');
var moment = require('moment-timezone');
var tzData = require('./timezone-data');

moment.tz.add(tzData);

exports.localMoment = function(date) {
  var timezone = this.props.config.get('timezone');
  return moment(date).tz(timezone);
};

exports.attachDependencies = function(params) {
  var errors = _.compact(_.map(this.dependencies, function(msg, dep) {
    if (params[dep]) {
      this[dep] = params[dep]
    } else {
      return msg
    }
  }, this));

  if (errors.length > 0) {
    throw new Error('Missing require dependencies:' + errors.join(', '));
  }
};
