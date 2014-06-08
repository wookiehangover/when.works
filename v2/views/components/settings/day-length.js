/**
 * @jsx React.DOM
 */

var React = require('react')

var TimeSelect = React.createClass({

  render: function() {
    return (
      <select
        className="input-small"
        name={this.props.name}
        defaultValue={this.props.selected}
        onChange={this.props.onChange} >
          {this.props.times.map(function(time){
            return (<option>{time}</option>)
          })}
      </select>
    )
  }

});

var DayLength = React.createClass({

  updateConfig: function(e) {
    var props = {}
    props[e.currentTarget.getAttribute('name')] = e.currentTarget.value
    this.props.config.set(props)
  },

  getInitialState: function() {
    return {
      startTimes: ['7am', '8am', '9am', '10am', '11am', '12pm'],
      endTimes: ['1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']
    }
  },

  render: function() {
    return (
    <div className="control-group day-length">
      <div className="day-start">
        <label className="control-label" for="start">Day Start:</label>
        <TimeSelect
          name="start"
          onChange={this.updateConfig}
          selected={this.props.config.get('start')}
          times={this.state.startTimes} />
      </div>
      <div className="day-end">
        <label className="control-label" for="end">Day End:</label>
        <TimeSelect
          name="end"
          onChange={this.updateConfig}
          selected={this.props.config.get('end')}
          times={this.state.endTimes} />
      </div>
    </div>
    )
  }

});

module.exports = DayLength;

