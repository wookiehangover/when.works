/**
 * @jsx React.DOM
 */

var React = require('react');

var Toggles = React.createClass({

  updateConfig: function(e) {
    var props = {}
    props[this.props.name] = e.currentTarget.checked;
    this.props.config.set(props)
  },

  render: function() {
    return (
      <div className="control-group toggles">
        <span>{this.props.label}</span>
        <label className="topcoat-switch">
          <input type="checkbox" name="ignoreWeekend" defaultChecked={this.props.config.get(this.props.name)} onChange={this.updateConfig} className="topcoat-switch__input" />
          <div className="topcoat-switch__toggle"></div>
        </label>
      </div>
    )
  }
});

module.exports = Toggles;
