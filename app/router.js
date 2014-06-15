var Backbone = require('backdash');

var Router = Backbone.Router.extend({

  initialize: function(options) {
    this.user = options.user;
    this.config = options.config;
  },

  routes: {
    '': function() {
      this.navigate('for/' + this.user.get('email'))
    },
    'for/:email': function(email) {
      this.calendar = email;
    }
  }
})

module.exports = Router;
