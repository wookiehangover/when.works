/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Backbone = require('backdash');
var CalendarList = require('./components/availability/calendar-list');
var crypto = require('crypto');

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

  removeTimeblock: function(time, e) {

  },

  getInitialState: function() {
    return {
      blacklist: []
    }
  },

  getImage: function(calendar) {
    var hash = crypto.createHash('md5');
    hash.update(calendar.toLowerCase().trim());
    return 'http://www.gravatar.com/avatar/' + hash.digest('hex');
  },


  render: function() {
    return (
      <div>
        <ul className="calendar-list">
          {_.map(this.props.config.get('calendars'), function(calendar){
            return (
              <li>
                <img src={this.getImage(calendar)}/>
                {calendar}
              </li>
            )
          }, this)}
        </ul>
        <CalendarList ref="list" times={this.props.availability.getAvailableTimes()} onClick={this.removeTimeblock} />
      </div>
    )
  }
}, Backbone.Events))

module.exports = Availability;
