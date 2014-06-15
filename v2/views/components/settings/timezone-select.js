/**
 * @jsx React.DOM
 */

var React = require('react')
var moment = require('moment-timezone')
var tzData = require('../../../lib/timezone-data');
var _ = require('lodash');

var TimezoneSelect = React.createClass({

  updateConfig: function(e) {
    var props = { timezone: e.currentTarget.value }
    this.props.config.set(props)
  },

  render: function() {
    return (
      <div className="control-group">
        <label>Timezone:</label>
        <select name="timezone" defaultValue={this.props.config.get('timezone')} onChange={this.updateConfig}>
          {_.map(tzData.zones, function(offset, name){
            return (<option key={name}>{name}</option>)
          })}
        </select>
      </div>
    )
  }

});

module.exports = TimezoneSelect;

