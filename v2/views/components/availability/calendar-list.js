/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

var CalendarList = React.createClass({
  render: function() {
    return (
      <div className="topcoat-list__container">
        <h3 className="topcoat-list__header">Here is when you are available:</h3>
        <ul className="topcoat-list">
          {this.props.times.map(function(time) {
            return (
              <li className="topcoat-list__item">
                <p>{time}</p>
                <button className="topcoat-button" onClick={this.onClick}>remove</button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
})

module.exports = CalendarList;
