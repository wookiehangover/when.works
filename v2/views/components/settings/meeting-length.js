/**
 * @jsx React.DOM
 */

var React = require('react')

var MeetingLength = React.createClass({

  updateConfig: function(e) {
    var props = { minDuration: parseInt(e.currentTarget.value, 10) }
    this.props.config.set(props)
  },

  render: function() {
    return (
      <div className="control-group slider">
        <label>Meeting Length:</label>
        <input type="text" size="2" readOnly
          className="topcoat-text-input"
          value={this.props.config.get('minDuration') + ' min'} />
        <input type="range"
          name="minDuration" className="topcoat-range"
          min="15" max="120" step="15"
          defaultValue={this.props.config.get('minDuration')}
          onChange={this.updateConfig} />
      </div>
    )
  }

});

module.exports = MeetingLength;
