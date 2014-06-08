var Backbone = require('backdash');
var moment = require('moment');

function getFormat() {
  if (window.Intl === undefined || window.Intl.DateTimeFormat === undefined) {
    return;
  }

  var format = window.Intl.DateTimeFormat();

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
      timezone: getFormat(),
      ignoreWeekend: true,
      calendars: [this.user.get('email')]
    };
  }
});
