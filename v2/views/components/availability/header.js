/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var crypto = require('crypto');

var AvailabilityHeader = React.createClass({

  getImage: function(calendar) {
    var hash = crypto.createHash('md5');
    hash.update(calendar.toLowerCase().trim());
    return 'http://www.gravatar.com/avatar/' + hash.digest('hex');
  },

  render: function() {
    return (
      <header>
        <ul className="calendar-list">
          {_.map(this.props.calendars, function(calendar){
            return (
              <li>
                <img src={this.getImage(calendar)}/>
                {calendar}
              </li>
            )
          }, this)}
        </ul>
      </header>
    )
  },

})

module.exports = AvailabilityHeader;

