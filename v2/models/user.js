var Backbone = require('backdash');

module.exports = Backbone.Model.extend({
  url: '/me',

  initialize: function() {
    this.load = this.fetch();
  }
});
