/**
 * @jsx React.DOM
 */

var $ = require('jquery');
window.jQuery = $;
var React = require('react');
var _ = require('lodash');
var Backbone = require('backdash');

// Components
var CalendarSelect = require('./calendar-select');
var CalendarAdd = require('./calendar-add');
var Datepicker = require('./datepicker');
var MeetingLength = require('./meeting-length');
var DayLength = require('./day-length');
var TimezoneSelect = require('./timezone-select');
var Toggle = require('./toggle');

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
        <Toggle
          label="Hide Weekends:"
          name="ignoreWeekend"
          config={this.props.config} />
      </form>
    )
  }

}, Backbone.Events));

module.exports = Settings;
