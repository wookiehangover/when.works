var Backbone = require('backdash');
var BASE_URL = process.env.BASE_URL || '';

module.exports = Backbone.Collection.extend({
  url: BASE_URL + '/api/calendars',

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
