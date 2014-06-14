/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

var CalendarList = React.createClass({
  render: function() {
    return (
      <div className="topcoat-list__container">
        <h3 className="topcoat-list__header">Here is when you are available: <a href="#" onClick={this.props.reset}>Reset</a></h3>
        <ul className="topcoat-list">
          {this.props.times.map(function(time) {
            return (
              <li className="topcoat-list__item">
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
