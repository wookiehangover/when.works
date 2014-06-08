/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Backbone = require('backdash');
var CalendarList = require('./components/availability/calendar-list');

var Availability = React.createClass(_.extend({

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
    this.listenTo(this.props.availability, 'sync', update)
  },

  componentDidUnmount: function() {
    this.stopListening();
  },

  presentTimeblockList: function() {
    var untaken = _.reject(this.props.availability.getUntaken(), function(time, i) {
      return _.indexOf(this.state.blacklist, i) > -1;
    }, this);

    return _.map(untaken, function(time) {
      return '• ' + time;
    }).join('\n');
  },

  removeTimeblock: function(e) {

  },

  getInitialState: function() {
    return {
      blacklist: []
    }
  },

  render: function() {
    return (
      <div>
        <CalendarList ref="list" times={this.props.availability.getUntaken()} onClick={this.removeTimeblock} />
      </div>
    )
  }
}, Backbone.Events))

module.exports = Availability;
