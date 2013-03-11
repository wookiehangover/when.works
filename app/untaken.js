define(function(require, exports, module){
  var $ = require('jquery');
  var Backbone = require('backbone');

  var User = require('models/user');
  var Calendars = require('collections/calendars');
  var Availability = require('collections/taken');

  var PickerView = require('views/picker');
  var AvailabilityView = require('views/availability');

  module.exports = Backbone.View.extend({
    elem: $('body'),

    initialize: function(){
      var untaken = window.untaken = this;

      this.config = new Backbone.Model();
      this.user = new User();
      this.calendars = new Calendars();
      this.availability = new Availability({ config: this.config });

      this.picker = new PickerView({ collection: this.calendars, model: this.config });
      this.output = new AvailabilityView({ collection: this.availability });
    }
  });
});
