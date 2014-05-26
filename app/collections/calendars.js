define(function(require, exports, module) {
  var Backbone = require('backbone');

  module.exports = Backbone.Collection.extend({
    url: '/api/calendars',

    initialize: function() {
      this.dfd = this.fetch();
    },

    parse: function(obj) {
      return obj.items;
    },

    comparator: function(model) {
      return model.get('summary');
    }
  });
});
