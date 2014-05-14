define(function(require, exports, module) {
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  var User = require('models/user');
  var Calendars = require('collections/calendars');
  var Availability = require('collections/taken');

  var SettingsView = require('views/settings');
  var AvailabilityView = require('views/availability');

  module.exports = Backbone.View.extend({
    el: $('body'),

    duration: 15e3,

    initialize: function() {
      this.config = new Backbone.Model({
        start: '10am',
        end: '6pm'
      });

      this.user = new User();

      this.user.load.then(_.bind(function() {
        this.$el.removeClass('logged-out');
      }, this));

      this.calendars = new Calendars();

      this.settings = new SettingsView({
        collection: this.calendars,
        model: this.config,
        user: this.user
      });

      this.availability = new Availability(null, {
        config: this.config
      });

      this.output = new AvailabilityView({
        collection: this.availability
      });

      $(document).ajaxError(function(e, xhr) {
        if (xhr.status === 401) {
          location.replace('/auth/google');
        }
      });
    }
  });
});
