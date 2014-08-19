/**
 * @jsx React.DOM
 */

var React = require('react');
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

  removeCalendar: function(calendar, e) {
    e.preventDefault();
    var calendars = this.props.config.get('calendars');
    this.props.config.set('calendars', _.without(calendars, calendar));
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

    this.listenTo(this.props.config, 'change:calendars', function(config) {
      if (config.get('calendars').length === 0) {
        update();
      }
    });

    this.listenTo(this.props.config, changeEvents, update)
    this.listenTo(this.props.calendars, 'sync', update)
    this.listenTo(this.props.availability, 'sync', update)
  },

  componentDidUnmount: function() {
    this.stopListening();
  },

  renderTable: function(options) {
    var intervals = options.intervals

    if (this.props.availability.length === 0) {
      return '';
    }

    return (
      <table className="calendar-grid">
        <thead>
          <tr>
            <td></td>
            <td>{options.days[0]}</td>
            <td>{options.days[1]}</td>
            <td>{options.days[2]}</td>
            <td>{options.days[3]}</td>
            <td>{options.days[4]}</td>
          </tr>
        </thead>
        <tbody>
          {_.map(options.rows, function(dayblock, i) {
            var label = /30/.test(intervals[i]) ? '': intervals[i];
            return (
              <tr>
                <td className="label">{label}</td>
                {_.map(dayblock, function(booked) {
                  var className = booked ? "booked" : "";
                  return <td className={className}></td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  },

  render: function() {
    var times = this.props.availability.getAvailableTimes(this.state.blacklist);
    var activeCalendars = this.props.config.get('calendars');
    var calendars = this.props.calendars.filter(function(cal) {
      return _.contains(activeCalendars, cal.id);
    });

    var calendarTable = this.props.availability.presentCalendar(
      this.props.availability.getDayblocks(activeCalendars)
    );

    return (
      <div>
        {this.renderTable(calendarTable)}
        <CalendarList
          ref="list"
          times={times}
          reset={this.reset}
          calendars={calendars}
          blacklistActive={this.state.blacklist.length > 0}
          removeTimeblock={this.removeTimeblock} />

        <footer>
          <CopyButton times={times} calendars={activeCalendars} />
        </footer>
      </div>
    )
  },

}, Backbone.Events))

module.exports = Availability;
