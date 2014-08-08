/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var Modal = require('../../modal');
var ZeroClipboard = window.ZeroClipboard;

var CopyButton = React.createClass({

  presentTimeblockList: function() {
    return _.map(this.props.times, function(time) {
      return '• ' + time;
    }).join('\n');
  },

  removeOverlay: function() {
    $('#global-zeroclipboard-html-bridge').remove();
  },

  setupClipboard: function() {
    var node = this.getDOMNode();
    var clip = new ZeroClipboard(node, {
      moviePath: '/js/ZeroClipboard.swf',
      activeClass: 'is-active'
    });

    if (ZeroClipboard.detectFlashSupport() === false) {
      this.removeOverlay();
    }

    var self = this;
    clip.on('load', function() {
      self.hasFlash = true;
    });

    _.delay(function() {
      if (!this.hasFlash) {
        this.removeOverlay();
      }
    }.bind(this), 500);

    clip.on('dataRequested', this.onDataRequested);
  },

  onDataRequested: function(client) {
    client.setText(this.presentTimeblockList());

    var text = this.state.copyText;
    this.setState({ copyText: 'Copied!' });
    setTimeout(function() {
      this.setState({ copyText: text });
    }.bind(this), 1000);
  },

  // Event Handlers

  copyFallback: function(e) {
    e.preventDefault();
    var modal = new Modal({
      id: 'copy-modal',
      title: this.props.calendars.join(', '),
      body: this.presentTimeblockList()
    });

    setTimeout(function() {
      modal.$('textarea').select();
    }, 1000)
  },

  // React Methods

  getInitialState: function() {
    return {
      copyText: "Copy to Clipboard"
    }
  },

  componentDidMount: function() {
    this.setupClipboard();
  },

  componentDidUnmount: function() {

  },

  render: function() {
    return (
      <button className="topcoat-button effeckt-button expand-right copy" onClick={this.copyFallback}>
        <span className="label">{this.state.copyText}</span>
        <span className="spinner"></span>
      </button>
    )
  }

})

module.exports = CopyButton;

