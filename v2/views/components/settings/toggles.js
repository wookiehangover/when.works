/**
 * @jsx React.DOM
 */

var React = require('react');

var Toggles = React.createClass({

  updateConfig: function(e) {
    var props = {}
    props[e.currentTarget.getAttribute('name')] = e.currentTarget.value === 'on' ? true : false;
    this.props.config.set(props)
  },

  render: function() {
    return (
      <div className="control-group toggles">
        <span>Hide Weekends:</span>
        <label className="topcoat-switch">
          <input type="checkbox" name="ignoreWeekend" defaultChecked={this.props.config.get('ignoreWeekend')} onChange={this.updateConfig} className="topcoat-switch__input" />
          <div className="topcoat-switch__toggle"></div>
        </label>
      </div>
    )
  }
});

module.exports = Toggles;
