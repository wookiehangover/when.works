var Backbone = require('backdash');
var moment = require('moment');
var jstz = require('../lib/jstz').jstz;

function getFormat() {
  if (this.Intl === undefined || this.Intl.DateTimeFormat === undefined) {
    return;
  }

  var format = this.Intl.DateTimeFormat();

  if (format === undefined || format.resolvedOptions === undefined) {
    return
  }

  return format.resolvedOptions().timeZone;
}

module.exports = Backbone.Model.extend({

  constructor: function(attrs, options) {
    this.user = options.user;
    Backbone.Model.apply(this, arguments);
  },

  defaults: function() {
    return {
      timeMin: moment().format(),
      timeMax: moment().endOf('week').format(),
      start: '10am',
      end: '6pm',
      minDuration: 30,
      timezone: getFormat() || jstz.determine().name(),
      ignoreWeekend: true,
      calendars: [this.user.get('email')]
    };
  }
});
