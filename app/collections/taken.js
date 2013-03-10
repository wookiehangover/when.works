define(function(require, exports, module){
  var Backbone = require('backbone');

  module.exports = Backbone.Collection.extend({
    url: '/untaken',

    initialize: function(){
      this.dfd = this.fetch();
    },

    parse: function( obj ){
      return obj.calendars;
    }
  });
});

