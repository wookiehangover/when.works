define(function(require, exports, module){
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  var Modal = Backbone.View.extend({

    className: 'modal',

    template: require('tpl!templates/modal.ejs'),

    initialize: function(options){
      if( options.title ) {
        this.title = options.title;
      }
      if( options.body ){
        this.body = options.body;
      }
      this.render().appendTo( $('body') );
      this.show();
    },

    render: function(){
      this.$el.html( this.template() );
      return this.$el;
    },

    events: {
      'click [data-action="dismiss"]': 'dismiss'
    },

    dismiss: function(event){
      event.preventDefault();
      this.hide();
      this.remove();
    },

    hide: function(){
      this.$el.removeClass('ui-active');
      $('html').removeClass('show-modal');
    },

    show: function(){
      this.$el.addClass('ui-active');
      $('html').addClass('show-modal');
    }

  });

  module.exports = Modal;

});
