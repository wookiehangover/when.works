define(function(require, exports, module){
  var Backbone = require('backbone');

  module.exports = Backbone.Model.extend({
    url: '/me',

    initialize: function(){
      this.dfd = this.fetch();
    }
  });
});
