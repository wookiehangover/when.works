define(function(require, exports, module){
  var $ = require('jquery');
  var Backbone = require('backbone');

  module.exports = Backbone.View.extend({
    el: $('.calendars > .picker'),

    initialize: function(params){
      this.collection.dfd.done( this.render.bind(this) );
    },

    template: require('tpl!templates/picker.ejs'),

    render: function(){
      this.$el.html( this.template(this) );
    }
  });
});
