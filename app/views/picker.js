define(function(require, exports, module){
  var $ = require('jquery');
  var Backbone = require('backbone');
  var moment = require('moment');

  require('pickadate');

  function createDateArray( date ) {
    return date.split( '-' ).map(function( value ) { return +value; });
  }

  module.exports = Backbone.View.extend({
    el: $('.calendars .picker'),

    initialize: function(params){
      if( !this.collection || !this.model ){
        throw new Error('You must pass a model and a collection');
      }
      this.listenTo( this.collection, 'reset', this.render, this);

      this.collection.dfd.done( this.render.bind(this) );
    },

    events: {
      'change select,input': 'updateConfig'
    },

    updateConfig: function(e){
      var $elem = $(e.currentTarget);

      this.model.set( $elem.attr('name'), $elem.val() );
    },

    updateAllConfigs: function(e){
      var model = this.model;

      this.$('input, select').each(function(){
        model.set( $(this).attr('name'), $(this).val() );
      });
    },

    template: require('tpl!templates/picker.ejs'),

    render: function(){
      this.$el.html( this.template(this) );

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

      start.data('pickadate').setDate( today.year(), today.month() + 1, today.date() );
      end.data('pickadate').setDate( nextWeek.year(), nextWeek.month() + 1, nextWeek.date() );

      this.updateAllConfigs();

    }
  });
});
