define(function(require, exports, module){
  var $ = require('jquery');
  var moment = require('moment');
  var Backbone = require('backbone');

  var START_TIME = '10';
  var END_TIME   = '18';

  module.exports = Backbone.Collection.extend({
    url: function(){

      console.log(this.config.toJSON() )
      var query = $.param({
        calendar: this.config.get('calendar'),
        timeMin: moment( this.config.get('timeMin') ).format(),
        timeMax: moment( this.config.get('timeMax') ).format()
      });

      return '/untaken?'+ query;
    },

    initialize: function(params){
      this.config = params.config;

      this.config.on('change', function(model){
        if( model.get('timeMax') && model.get('timeMin') && model.get('calendar') ){
          this.fetch();
        }
      }, this);
    },

    parse: function( obj ){
      return obj.calendars[ this.config.get('calendar') ].busy;
    },

    getUntaken: function(){
      return this.map(function(model, i, list){
        var start = moment( model.get('start') ).local();
        var end   = moment( model.get('end') ).local();

        if( i + 1 === this.length ){
          next = end;
        } else {
          var next  = moment( this.at(i + 1).get('start') ).local();
          var nextEnd = moment( this.at(i + 1).get('end') ).local()
        }

        var dayStart = start.startOf('day').add('hours', START_TIME);

        // begin availbaility block with either the beging of the day or the end of the first meeting
        var beginning = start.hour() - dayStart.hours() > 0 ? dayStart : end;

        var ending = next.date() === beginning.date() ?
          next : start.startOf('day').add('hours', END_TIME);

        var beginningFormat = beginning.minutes() === 0 ? 'h' : 'h:mm';
        var endFormat = ending.minutes() === 0 ? 'ha' : 'h:mma';

        if( ending.format('a') !== beginning.format('a') ){
          beginningFormat += 'a';
        }

        var timeblock = beginning.format('dddd M/D - '+ beginningFormat +' to ') + ending.format(endFormat);

        return timeblock;
      }, this);
    }
  });
});

