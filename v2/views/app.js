var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backdash');
Backbone.$ = $;

var User = require('../models/user');
var Config = require('../models/config');
var Calendars = require('../collections/calendars');
var Availability = require('../collections/availability');

var React = require('react');
window.React = React;

var Settings = require('./settings');
var AvailabilityComponent = require('./availability');

module.exports = Backbone.View.extend({
  el: $('body'),

  initialize: function() {
    this.user = new User(window.userData || {});
    this.config = new Config(null, { user: this.user });
    this.calendars = new Calendars();
    this.availability = new Availability(null, {
      config: this.config
    });

    if (this.user.load) {
      this.user.load.then(_.bind(function() {
        this.$el.removeClass('logged-out');
      }, this));
    }

    var injector = {
      user: this.user,
      config: this.config,
      calendars: this.calendars,
      availability: this.availability
    }

    this.settings = React.renderComponent(
      Settings(injector),
      this.$('.picker').get(0)
    );

    this.output = React.renderComponent(
      AvailabilityComponent(injector),
      this.$('.availability').get(0)
    );

    $(document).ajaxError(function(e, xhr) {
      if (xhr.status === 401) {
        location.replace('/auth/google');
      }
    });
  }
});
