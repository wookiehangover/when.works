var Backbone = require('backdash');

module.exports = Backbone.Collection.extend({
  url: '/api/calendars',

  initialize: function() {
    this.load = this.fetch();
  },

  parse: function(obj) {
    return obj.items;
  },

  comparator: function(model) {
    return model.get('summary');
  }
});
