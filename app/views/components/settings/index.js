/**
 * @jsx React.DOM
 */

var $ = require('jquery');
window.jQuery = $;
var React = require('react');
var _ = require('lodash');
var Backbone = require('backdash');

// Components
var Datepicker = require('./datepicker');
var MeetingLength = require('./meeting-length');
var DayLength = require('./day-length');
var TimezoneSelect = require('./timezone-select');
var Toggle = require('./toggle');

var Settings = React.createClass({

  mixins: [Backbone.Events],

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

});

module.exports = Settings;
