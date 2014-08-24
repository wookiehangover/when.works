/**
 * @jsx React.DOM
 */

var $ = require('jquery');
var React = require('react');
var addons = require('react/addons');
var moment = require('moment-timezone');
var picker = require('../../../lib/pickadate');

// Helpers

function createDateArray(date) {
  return date.split('-').map(function(value) {
    return +value;
  });
}

// Sub-components

var Button = React.createClass({
  render: function() {
    var classes = ['topcoat-button']
    if (this.props.active !== this.props.id) {
      classes.push('topcoat-button--quiet')
    }

    return (
      <a href="#"
        className={classes.join(' ')}
        data-week={this.props.id}
        onClick={this.props.action}>{this.props.label}</a>
    )
  }
})

var Datepicker = React.createClass({

  setDatePicker: function(start, end) {
    this.props.config.unset('timeMin', { silent: true });
    this.props.config.unset('timeMax', { silent: true });

    this.startDate.data('pickadate')
      .setDate(start.year(), start.month() + 1, start.date());

    this.endDate.data('pickadate')
      .setDate(end.year(), end.month() + 1, end.date());
  },

  renderDatePicker: function() {
    var start = this.startDate = this.$('input[name="timeMin"]').pickadate({
      onSelect: function() {
        var fromDate = createDateArray(this.getDate('yyyy-mm-dd'));
        end.data('pickadate').setDateLimit(fromDate);
      }
    });

    var end = this.endDate = this.$('input[name="timeMax"]').pickadate({
      onSelect: function() {
        var toDate = createDateArray(this.getDate('yyyy-mm-dd'));
        start.data('pickadate').setDateLimit(toDate, 1);
      }
    });

    var today = moment();
    var nextWeek = moment().endOf('week');

    this.setDatePicker(today, nextWeek);
  },

  setCalendarRange: function(e) {
    e.preventDefault();

    var week = e.currentTarget.dataset.week;
    this.setState({ activeRange: week });

    switch(week) {
      case 'current':
        this.$('.custom-range').slideUp();
        this.setDatePicker(moment(), moment().endOf('week'));
        break;
      case 'next':
        this.$('.custom-range').slideUp();
        var nextWeek = moment().add('w', 1);
        this.setDatePicker(nextWeek.clone().startOf('week'), nextWeek.clone().endOf('week'));
        break;
      case 'custom':
        this.$('.custom-range').slideDown();
        break;
      default:
        break;
    }
  },

  updateConfig: function(e) {
    var props = {};
    props[$(e.currentTarget).attr('name')] = e.currentTarget.value
    this.props.config.set(props);
  },

  mixins: [addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      activeRange: 'current',
      timeMin: Date.now(),
      timeMax: Date.now()
    }
  },

  componentDidMount: function() {
    var node = this.getDOMNode();
    this.$ = function(selector) {
      return $(node).find(selector);
    }

    $(node).on('change', 'input', this.updateConfig);
    this.renderDatePicker();
  },

  componentDidUnmount: function() {
    this.$('input').off('change');
  },


  render: function() {
    var expand = (<span className="icomatic">expand</span>)

    return (
      <div className="control-group calendar-range">
        <Button action={this.setCalendarRange} active={this.state.activeRange} id="current" key="current" label="This Week" />
        <Button action={this.setCalendarRange} active={this.state.activeRange} id="next" key="next" label="Next Week" />
        <Button action={this.setCalendarRange} active={this.state.activeRange} id="custom" key="custom" label={['Custom Range ', expand]} />
        <div className="custom-range">
          <input type="text" name="timeMin" defaultValue={this.props.config.get('timeMin')} className="datepicker topcoat-text-input" />
          <input type="text" name="timeMax" defaultValue={this.props.config.get('timeMax')} className="datepicker topcoat-text-input" />
        </div>
      </div>
    )
  }

});

module.exports = Datepicker;
