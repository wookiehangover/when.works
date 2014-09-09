/**
 * @jsx React.DOM
 */

var React = require('react');
var Typeahead = require('react-typeahead').Typeahead;
var Tokenizer = require('react-typeahead').Tokenizer;
var Backbone = require('backdash');

var Search = React.createClass({

  mixins: [Backbone.Events],

  componentDidMount: function() {
    var update = function() {
      this.forceUpdate();
    }.bind(this)
    this.listenTo(this.props.config, 'change', update)
    this.listenTo(this.props.calendars, 'sync', update)
  },

  updateCalendars: function(active) {
    var calendars = this.props.calendars.filter(function(cal) {
       return _.contains(active, cal.get('summary'))
    })
    this.props.config.set({ calendars: _.pluck(calendars, 'id') })
    this.props.config.trigger('change:calendars', this.props.config);
    this.props.config.trigger('change');
  },

  render: function() {
    if (this.props.calendars.length === 0 && this.props.config.get('calendars')) {
      return <div></div>
    } else {
      return Tokenizer({
        maxResults: 4,
        onTokenAdd: this.updateCalendars,
        onTokenRemove: this.updateCalendars,
        placeholder: 'Add another calendar',
        options: this.props.calendars.pluck('summary'),
        defaultSelected: this.props.config.get('calendars'),
        customClasses: {
          input: "topcoat-text-input",
          token: "topcoat-button"
        }
      })
    }
  }

});

module.exports = Search;
