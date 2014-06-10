/**
 * @jsx React.DOM
 */

var $ = require('jquery');
window.jQuery = $;
var React = require('react');
var _ = require('lodash');
var Backbone = require('backdash');

// Components
var CalendarSelect = require('./components/settings/calendar-select');
var CalendarAdd = require('./components/settings/calendar-add');
var Datepicker = require('./components/settings/datepicker');
var MeetingLength = require('./components/settings/meeting-length');
var DayLength = require('./components/settings/day-length');
var TimezoneSelect = require('./components/settings/timezone-select');
var Toggles = require('./components/settings/toggles');

var Settings = React.createClass(_.extend({

  componentDidMount: function() {
    var update = function update(){
      this.forceUpdate()
    }.bind(this);

    this.listenTo(this.props.config, 'change', update)
    this.listenTo(this.props.calendars, 'sync change', update)
  },

  componentDidUnmount: function() {
    this.stopListening();
  },

  render: function() {
    return (
      <form>
        <CalendarSelect calendars={this.props.calendars} config={this.props.config} user={this.props.user} />
        <CalendarAdd calendars={this.props.calendars} config={this.props.config} />
        <Datepicker config={this.props.config} />
        <TimezoneSelect config={this.props.config} />
        <MeetingLength config={this.props.config} />
        <DayLength config={this.props.config} />
        <Toggles config={this.props.config} />
      </form>
    )
  }

}, Backbone.Events));

module.exports = Settings;
