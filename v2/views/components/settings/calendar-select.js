/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

var crypto = require('crypto');

var SelectList = React.createClass({

  render: function() {
    var selected = this.props.value;
    var calendars = this.props.config.get('calendars');
    var options = _.transform(this.props.calendars.toJSON(), function(result, model){
      if (model.id === selected || _.indexOf(calendars, model.id) < 0) {
        result.push(<option value={model.id}>{model.summary}</option>)
      }
    });

    var classList = ['calendar-select'];

    if (this.props.multiple) {
      classList.push('multiple')
    }

    return (
      <div className={classList.join(' ')}>
        <select name="calendar" onChange={_.partial(this.props.onChange, this.props.value)} value={this.props.value}>
          {options}
        </select>
        <button className="topcoat-button remove" onClick={_.partial(this.props.onRemove, this.props.value)}>-</button>
      </div>
    )
  }
})

var CalendarSelect = React.createClass({

  removeCalendar: function(calendar, e) {
    e.preventDefault();
    var calendars = this.props.config.get('calendars');
    this.props.config.set('calendars', _.without(calendars, calendar));
    this.props.config.trigger('change');
  },

  updateConfig: function(origValue, e) {
    var calendars = this.props.config.get('calendars');
    calendars = _.without(calendars, origValue);
    calendars.push(e.currentTarget.value);
    this.props.config.set('calendars', calendars);
    this.props.config.trigger('change:calendars', this.props.config);
  },

  getInitialState: function() {
    return {
      multiple: false
    }
  },

  render: function() {
    var classList = ['control-group'];

    return (
      <div className={classList.join(' ')}>
        <label>Calendar:</label>
        {this.props.calendars.length > 0 ? _.map(this.props.config.get('calendars'), function(calendar, i){
          return SelectList({
            ref: 'add-'+ i,
            value: calendar,
            config: this.props.config,
            calendars: this.props.calendars,
            onChange: this.updateConfig,
            onRemove: this.removeCalendar,
            multiple: (i >= 1)
          })
        }, this) : ''}
      </div>
    )
  }

});

module.exports = CalendarSelect;
