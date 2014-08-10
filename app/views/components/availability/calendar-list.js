/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var _ = require('lodash');
var CSSTransitionGroup = React.addons.CSSTransitionGroup;

var CalendarList = React.createClass({
  render: function() {
    var style = this.props.blacklistActive ? {} : { display: 'none' };

    return (
      <div className="topcoat-list__container">
        <h3 className="topcoat-list__header">
          Here is when you are available: <a href="#" onClick={this.props.reset} style={style}>Reset</a>
        </h3>
        <CSSTransitionGroup transitionName="fadeIn" className="topcoat-list" component={React.DOM.ul}>
          {this.props.times.map(function(time) {
            return (
              <li className="topcoat-list__item" key={time}>
                <p>{time}</p>
                <button className="topcoat-button" onClick={_.partial(this.props.removeTimeblock, time)}>remove</button>
              </li>
            )
          }.bind(this))}
        </CSSTransitionGroup>
      </div>
    )
  }
})

module.exports = CalendarList;
