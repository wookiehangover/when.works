var Backbone = require('backdash');
var BASE_URL = process.env.BASE_URL || '';

module.exports = Backbone.Model.extend({
  url: BASE_URL + '/me'
});
