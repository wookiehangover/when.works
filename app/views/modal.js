var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backdash');

module.exports = Backbone.View.extend({

  className: 'modal',

  template: require('../templates/modal.html'),

  initialize: function(options) {
    if (options.title) {
      this.title = options.title;
    }
    if (options.body) {
      this.body = options.body;
    }

    $(document).on('keydown.modal', function(e){
      if (e.which === 27) {
        this.dismiss(e);
      }
    }.bind(this))

    this.render().appendTo($('body'));
    this.show();
  },

  render: function() {
    this.$el.html(this.template());
    return this.$el;
  },

  events: {
    'click [data-action="dismiss"]': 'dismiss'
  },

  dismiss: function(event) {
    event.preventDefault();
    this.hide();
    this.remove();
    $(document).off('keydown.modal');
  },

  hide: function() {
    this.$el.removeClass('ui-active');
    $('html').removeClass('show-modal');
  },

  show: function() {
    $(window).scrollTop(0);
    this.$el.addClass('ui-active');
    $('html').addClass('show-modal');
  }
});
