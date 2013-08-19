define(function(require, exports, module){
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  module.exports = Backbone.View.extend({
    el: $('.availability'),

    initialize: function(params){
      if( !this.collection ){
        throw new Error('You must pass a model collection');
      }
      this.listenTo( this.collection, 'sync', this.render, this);
      this.listenTo( this.collection.config, 'change:ignoreWeekend change:start change:end change:showUnavailable', this.render, this);
    },

    setupClipboard: function(){
      var clip = new ZeroClipboard( this.$('button[data-action="copy"]')[0], {
        moviePath: '/js/ZeroClipboard.swf',
        activeClass: 'is-active'
      });

      var self = this;
      clip.on('dataRequested', function(client){
        client.setText(self.presentUntaken());
      });
    },

    template: require('tpl!templates/availability.ejs'),

    render: function(){
      this.blacklist = [];

      var untaken = this.collection.getUntaken();
      this.$el.html( this.template({ untaken: untaken }) );
      this.setupClipboard();
    },

    presentUntaken: function(){
      var untaken = _.reject(this.collection.getUntaken(), function(time, i){
        return _.indexOf(this.blacklist, i) > -1;
      }, this);

      return _.map(untaken, function(time){
        return '• '+ time;
      }).join('\n');
    },

    events: {
      'click [data-action="remove-item"]': 'removeItem'
    },

    removeItem: function(e){
      e.preventDefault();
      var index = $(e.currentTarget).parent().data('orig-index');
      this.blacklist.push( index );
      $(e.currentTarget).parent().remove();
    }
  });
});
