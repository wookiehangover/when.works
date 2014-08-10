var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backdash');
Backbone.$ = $;

window.Backbone = Backbone;

var User = require('../models/user');
var Config = require('../models/config');
var Calendars = require('../collections/calendars');
var Availability = require('../collections/availability');

var React = require('react');
window.React = React;

var Settings = require('./components/settings');
var AvailabilityComponent = require('./components/availability');

var Router = require('../router');

module.exports = Backbone.View.extend({
  el: $('body'),

  initialize: function() {
    this.user = new User(window.userData || {});
    this.config = new Config(null, { user: this.user });
    this.calendars = new Calendars();
    this.availability = new Availability(null, {
      config: this.config,
      calendars: this.calendars
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

    this.router = new Router(injector);
    Backbone.history.start({ pushState: true });

    $(document).ajaxError(function(e, xhr) {
      if (xhr.status === 401) {
        location.replace('/auth/google');
      }
    });
  },

  events: {
    "click #main-header .user": function(e) {
      if ($(window).width() < 650) {
        e.stopPropagation();
        $('.picker').toggleClass('active')
      }
    }
  }
});
