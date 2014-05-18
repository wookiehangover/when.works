define(function(require, exports, module) {
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Modal = require('views/modal');

  module.exports = Backbone.View.extend({
    el: $('.availability'),

    initialize: function(params) {
      if (!this.collection) {
        throw new Error('You must pass a model collection');
      }

      this.listenTo(this.collection, 'sync', this.render, this);

      var changeEvents = [
        'change:ignoreWeekend',
        'change:start',
        'change:end',
        'change:showUnavailable',
        'change:timezone',
        'change:minDuration'
      ].join(' ');

      this.listenTo(this.collection.config, changeEvents, this.render, this);
    },

    hasFlash: false,

    setupClipboard: function() {
      var clip = new ZeroClipboard(this.$('button[data-action="copy"]')[0], {
        moviePath: '/js/ZeroClipboard.swf',
        activeClass: 'is-active'
      });

      var self = this;

      function removeOverlay() {
        $('#global-zeroclipboard-html-bridge').remove();
      }

      if (ZeroClipboard.detectFlashSupport() === false) {
        removeOverlay();
      }

      clip.on('load', function() {
        self.hasFlash = true;
      });

      _.delay(function() {
        if (self.hasFlash === false) {
          removeOverlay();
        }
      }, 500);

      clip.on('dataRequested', function(client) {
        client.setText(self.presentUntaken());
        var btn = self.$('.copy .label');
        var text = btn.text();
        btn.text('Copied!');
        setTimeout(function() {
          btn.text(text);
        }, 2000);
      });
    },

    template: require('tpl!templates/availability.ejs'),

    render: function() {
      if (!this.collection.loaded) {
        return;
      }

      this.blacklist = [];

      this.renderTimes(this.collection.getUntaken());
      this.setupClipboard();
    },

    renderTimes: function(untaken) {
      this.$el.html(this.template({
        untaken: untaken
      }));
    },

    presentUntaken: function() {
      var untaken = _.reject(this.collection.getUntaken(), function(time, i) {
        return _.indexOf(this.blacklist, i) > -1;
      }, this);

      return _.map(untaken, function(time) {
        return '• ' + time;
      }).join('\n');
    },

    events: {
      'click [data-action="remove-item"]': 'removeItem',
      'click [data-action="copy"]': 'copyFallback'
    },

    removeItem: function(e) {
      e.preventDefault();
      var index = $(e.currentTarget).parent().data('orig-index');
      this.blacklist.push(index);
      $(e.currentTarget).parent().remove();
    },

    copyFallback: function(e) {
      e.preventDefault();
      var modal = new Modal({
        id: 'copy-modal',
        title: this.collection.config.get('calendar'),
        body: this.presentUntaken()
      });

      modal.$('textarea').select();
    }
  });
});
