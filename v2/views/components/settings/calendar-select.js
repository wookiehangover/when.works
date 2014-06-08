/**
 * @jsx React.DOM
 */

var React = require('react');

var Select = React.createClass({
  render: function() {
    return (
      <div className="calendar-select">
        <select name="calendar" onChange={this.props.onChange} value={this.props.calendar}>
          {this.props.options}
        </select>
        <button className="topcoat-button remove" onClick={this.props.removeCalendar}>-</button>
      </div>
    )
  }
})

var CalendarSelect = React.createClass({

  removeCalendar: function(e) {
    e.preventDefault();
    // var calendars = this.model.get('calendar');
    // this.model.set('calendar', _.omit(calendars, $(e.currentTarget).val()));
    // this.$('.calendar-select select').trigger('change');
  },

  updateConfig: function(e) {
    if (this.state.multiple) {
      var calendars = this.props.config.get('calendars');
      calendars.push(e.currentTarget.value)
      this.props.config.set('calendars', _.unique(calendars));
    } else {
      console.log(e.currentTarget.value)
      this.props.config.set('calendars', [e.currentTarget.value]);
    }
  },

  getInitialState: function() {
    return {
      multiple: false
    }
  },

  render: function() {
    var options = this.props.calendars.map(function(model){
      return (
        <option value={model.get('id')}>{model.get('summary')}</option>
      )
    });

    return (
      <div className="control-group">
        <label>Calendar:</label>
        {this.props.calendars.length > 0 ? _.map(this.props.config.get('calendars'), function(calendar){
          return Select({
            ref: 'select-' + calendar,
            calendar: calendar,
            options: options,
            onChange: this.updateConfig,
            onRemove: this.removeCalendar
          })
        }, this) : ''}
        <button className="topcoat-button topcoat-button--quiet" onClick={this.addCalendar}>+ Add Another Calendar</button>
      </div>
    )
  }

});

module.exports = CalendarSelect;
