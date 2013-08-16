define(function(require, exports, module){
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var moment = require('moment');
  var cookie = require('cookie');
  var timezones = require('../timezones');

  require('pickadate');

  function createDateArray( date ) {
    return date.split( '-' ).map(function( value ) { return +value; });
  }

  module.exports = Backbone.View.extend({
    el: $('.picker'),

    initialize: function(params){
      if( !this.collection || !this.model ){
        throw new Error('You must pass a model and a collection');
      }

      this.listenTo( this.collection, 'reset', this.render);
      // this.listenTo( this.model, 'change:calendar', this.updateCalendar);

      this.collection.dfd.done( this.render.bind(this) );
    },

    events: {
      'change select,input': 'updateConfig'
    },

    updateConfig: function(e){
      var $elem = $(e.currentTarget);
      var name = $elem.attr('name');

      if( $elem.is('select') && $elem.val() ){
        cookie.set(name, $elem.val());
      }
      this.model.set(name, $elem.val());
    },

    updateAllConfigs: function(e){
      var model = this.model;

      this.$('input, select').each(function(){
        model.set( $(this).attr('name'), this.value );
      });
    },

    timezones: function(cb){
      return _.each(timezones, cb, this);
    },

    template: require('tpl!templates/picker.ejs'),

    render: function(){
      this.$el.html( this.template(this) );
      this.setCalendarFromCookie();
      this.renderDatePicker();
      this.setStartAndEnd();
      this.setTimezone();
      this.updateAllConfigs();
    },

    setStartAndEnd: function(){
      _.each(['start', 'end'], function(value){
        var c = cookie.get(value);
        if( c ){
          this.$('select[name="'+ value +'"]').val( c );
        }
      }, this);
    },

    setTimezone: function(){
      var timezone = moment().zone();
      var isDST = moment().isDST();
      var sign = moment().format('ZZ').substr(0,1);

      if( isDST ){
        timezone += 60;
      }

      var zoneKey = [sign + timezone, isDST ? 1 : 0].join(',');
      var zoneValue = _.filter(timezones, function(value){
        if( value.search( zoneKey ) > -1 ){
          return true;
        }
      });

      if( zoneValue.length ){
        this.$('select[name="timezone"]').val(zoneValue[0]);
      }
    },

    setCalendarFromCookie: function(){
      var calendar = cookie.get('calendar');
      if( calendar ){
        this.$('select[name="calendar"]').val(calendar);
      }
    },

    renderDatePicker: function(){
      var today = moment();
      var nextWeek = moment().add('days', 7);
      var lock = true;

      var start = this.$('input[name="timeMin"]').pickadate({
        onSelect: function(){
          var fromDate = createDateArray( this.getDate( 'yyyy-mm-dd' ) );
          end.data( 'pickadate' ).setDateLimit( fromDate );
        }
      });

      var end = this.$('input[name="timeMax"]').pickadate({
        onSelect: function() {
          var toDate = createDateArray( this.getDate( 'yyyy-mm-dd' ) );
          start.data( 'pickadate' ).setDateLimit( toDate, 1 );
        }
      });

      start.data('pickadate')
        .setDate( today.year(), today.month() + 1, today.date() );

      end.data('pickadate')
        .setDate( nextWeek.year(), nextWeek.month() + 1, nextWeek.date() );
    },

    updateCalendar: function(){
      var query = $.param({
        showTitle: 0,
        showNav: 0,
        showPrint: 0,
        showTabs: 0,
        showCalendars: 0,
        mode: 'WEEK',
        height: 400,
        wkst: 1,
        src: this.model.get('calendar')
      });

      var url = 'http://www.google.com/calendar/embed?'+ query;
      $('#calendar-embed').hide().attr('src', url).delay(1000).fadeIn();
    }

  });
});
