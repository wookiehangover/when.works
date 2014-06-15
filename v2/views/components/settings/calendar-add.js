/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

var CalendarAdd = React.createClass({

  toggleOpen: function(e) {
    e.preventDefault();
    this.setState({ open: !this.state.open })
  },

  updateConfig: function(e) {
    if (!e.currentTarget.value) {
      return
    }
    var calendars = this.props.config.get('calendars') || [];
    calendars.push(e.currentTarget.value)
    this.props.config.set({ calendars: _.unique(calendars) })
    this.props.config.trigger('change:calendars', this.props.config);
    this.props.config.trigger('change');
    this.setState({ open: false })
    e.currentTarget.value = null
  },

  getInitialState: function() {
    return {
      open: false
    };
  },

  render: function() {
    var calendars = this.props.config.get('calendars');
    var options = _.transform(this.props.calendars.toJSON(), function(result, model){
      if (_.indexOf(calendars, model.id) < 0) {
        result.push(<option value={model.id} key={model.id}>{model.summary}</option>)
      }
    });

    var classList = ['control-group', 'add-calendar'];

    if (this.state.open) {
      classList.push('ui-active')
    }

    return (
      <div className={classList.join(' ')}>
        <select onChange={this.updateConfig}>
          <option></option>
          {options}
        </select>
        <button className="topcoat-button topcoat-button--quiet" onClick={this.toggleOpen}>
          {this.state.open ? 'Cancel' : 'Add Another Calendar'}
        </button>
      </div>
    )
  }

});

module.exports = CalendarAdd;
