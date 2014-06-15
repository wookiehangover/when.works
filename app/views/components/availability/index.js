/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backdash');
var CalendarList = require('./calendar-list');
var AvailabilityHeader = require('./header');
var CopyButton = require('./copy-button');

var Availability = React.createClass(_.extend({

  // Event Handlers

  removeTimeblock: function(time, e) {
    var blacklist = this.state.blacklist;
    blacklist.push(time);
    this.setState({ blacklist: blacklist });
  },

  reset: function(e) {
    e.preventDefault();
    this.setState({ blacklist: [] });
  },

  // React Methods

  getInitialState: function() {
    return {
      blacklist: []
    }
  },

  componentDidMount: function() {
    var update = function update(){
      this.forceUpdate()
    }.bind(this);

    var changeEvents = [
      'change:ignoreWeekend',
      'change:start',
      'change:end',
      'change:showUnavailable',
      'change:timezone',
      'change:minDuration'
    ].join(' ');

    this.listenTo(this.props.config, changeEvents, update)
    this.listenTo(this.props.calendars, 'sync', update)
    this.listenTo(this.props.availability, 'sync', update)
  },

  componentDidUnmount: function() {
    this.stopListening();
  },

  render: function() {
    var times = this.props.availability.getAvailableTimes(this.state.blacklist);
    var calendars = this.props.config.get('calendars');
    return (
      <div>
        <AvailabilityHeader activeCalendars={calendars} calendars={this.props.calendars} />

        <CalendarList
          ref="list"
          times={times}
          reset={this.reset}
          blacklistActive={this.state.blacklist.length > 0}
          removeTimeblock={this.removeTimeblock} />

        <CopyButton times={times} calendars={calendars} />
      </div>
    )
  },

}, Backbone.Events))

module.exports = Availability;
