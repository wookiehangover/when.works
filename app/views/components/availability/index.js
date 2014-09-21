/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Backbone = require('backdash');
var CalendarList = require('./calendar-list');
var CalendarTable = require('./calendar-table');
var CopyButton = require('./copy-button');

var Availability = React.createClass({

  mixins: [Backbone.Events],

  // Event Handlers
  removeTimeblock: function(time, e) {
    var blacklist = this.state.blacklist;
    blacklist.push(time);
    this.setState({ blacklist: blacklist });
  },

  reset: function(e) {
    e.preventDefault();
    var blacklist = this.props.availability.get('blacklist');
    if (blacklist) {
      blacklist.set({ freebusy: [] });
    }
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

  onCellClick: function(cell) {
    if (cell.booked) {
      return false;
    }
    var time = cell.time;
    var model = this.props.availability.get('blacklist')
    var entry ={
      end: time.clone().add(30, 'minutes').format(),
      start: time.format()
    };

    if (model) {
      var free = model.get('freebusy');
      free.push(entry);
      model.set({ freebusy: free })
    } else {
      this.props.availability.add({
        id: 'blacklist',
        freebusy: [entry]
      })
    }

    this.forceUpdate()
  },

  render: function() {
    var times = this.props.availability.getAvailableTimes(this.state.blacklist);
    var activeCalendars = this.props.config.get('calendars');
    var calendars = this.props.calendars.filter(function(cal) {
      return _.contains(activeCalendars, cal.id);
    });

    var calendarTableProps = _.extend(this.props.availability.presentCalendar(
      this.props.availability.getDayblocks(activeCalendars)
    ), {
      onClick: this.onCellClick,
      availability: this.props.availability
    })

    var hasBlacklist = this.props.availability.get('blacklist') || this.state.blacklist.length > 0;

    return (
      <div>
        {CalendarTable(calendarTableProps)}
        <CalendarList
          ref="list"
          times={times}
          reset={this.reset}
          calendars={calendars}
          blacklistActive={hasBlacklist}
          removeTimeblock={this.removeTimeblock} />

        <footer>
          <CopyButton times={times} calendars={activeCalendars} />
        </footer>
      </div>
    )
  },

})

module.exports = Availability;
