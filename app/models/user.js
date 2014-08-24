var $ = require('jquery');
var Backbone = require('backdash');
var BASE_URL = process.env.BASE_URL || '';

module.exports = Backbone.Model.extend({
  url: BASE_URL + '/me',

  setAuthToken: function(authToken) {
    $.ajaxSetup({
      beforeSend: function(req) {
        req.setRequestHeader('auth_token', authToken);
      }
    });
  }
});
