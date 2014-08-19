/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var _ = require('lodash');
var CSSTransitionGroup = React.addons.CSSTransitionGroup;

var CalendarList = React.createClass({
  getImage: function(calendar) {
    var url = 'http://avatars.io/gravatar/' + calendar.id;
    return (
      <div className="avatar">
        <img src={url}  alt={calendar.get('summary')} />
        {calendar.get('summary')}
      </div>
    )
  },

  render: function() {
    var style = this.props.blacklistActive ? {} : { display: 'none' };
    var len = this.props.calendars.length;
    var calendars = this.props.calendars.map(function(calendar, i) {
      var delimiter = i + 1 !== len ? ', ' : '';
      var url = '/for/' + calendar.get('id');
      return (
        <span className="calendar-name">
          <a href={url}>{calendar.get('summary')}</a>
          {delimiter}
        </span>
      )
    });

    return (
      <div className="topcoat-list__container">
        <div className="topcoat-list__header">
          Here are the available times for:
          {calendars}
          <a href="#" className="reset" onClick={this.props.reset} style={style}>Reset</a>
        </div>
        <ul className="topcoat-list">
          {this.props.times.map(function(time) {
            return (
              <li className="topcoat-list__item" key={time}>
                <p>{time}</p>
                <button className="topcoat-button" onClick={_.partial(this.props.removeTimeblock, time)}>remove</button>
              </li>
            )
          }.bind(this))}
        </ul>
      </div>
    )
  }
})

module.exports = CalendarList;
