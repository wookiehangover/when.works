define(function(require, exports, module){
  var $ = require('jquery');
  var Backbone = require('backbone');

  module.exports = Backbone.View.extend({
    el: $('.calendars .availability'),

    initialize: function(params){
      if( !this.collection ){
        throw new Error('You must pass a model collection');
      }
      this.listenTo( this.collection, 'sync', this.render, this);
    },

    template: require('tpl!templates/availability.ejs'),

    render: function(){
      this.$el.html( this.template(this) );
    }
  });
});
