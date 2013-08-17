define(function(require, exports, module){
  var $ = require('jquery');
  var Backbone = require('backbone');

  var User = require('models/user');
  var Calendars = require('collections/calendars');
  var Availability = require('collections/taken');

  var PickerView = require('views/picker');
  var AvailabilityView = require('views/availability');

  module.exports = Backbone.View.extend({
    el: $('body'),

    initialize: function(){
      this.config = new Backbone.Model({
        start: '10am',
        end: '6pm'
      });

      this.user = new User();
      this.calendars = new Calendars();
      this.availability = new Availability(null, { config: this.config });

      this.picker = new PickerView({ collection: this.calendars, model: this.config });
      this.output = new AvailabilityView({ collection: this.availability });

      $(document).ajaxError(function(e, xhr){
        if( xhr.status === 401 ){
          location.replace('/auth/google');
        }
      });
    }
  });
});
