/**
 * @jsx React.DOM
 */

var React = require('react')
var _ = require('lodash')
var crypto = require('crypto')

var AvailabilityHeader = React.createClass({

  getImage: function(calendar) {
    if (calendar === this.props.user.get('email')) {
      return this.props.user.get('picture')
    }

    var hash = crypto.createHash('md5')
    hash.update(calendar.toLowerCase().trim())
    return 'http://www.gravatar.com/avatar/' + hash.digest('hex')
  },

  getBackgroundColor: function(color) {
    color = color.substr(1);
    var rgb = [
      parseInt(color.substr(0,2), 16),
      parseInt(color.substr(2,2), 16),
      parseInt(color.substr(4,2), 16)
    ];

    return 'rgba('+ rgb.join(',') +', 0.5)';
  },

  getCalendars: function() {
    return _.transform(this.props.activeCalendars, function(result, id){
      if (this.props.calendars && this.props.calendars.get(id)) {
        result.push(this.props.calendars.get(id))
      }
    }, [], this)
  },

  render: function() {
    var calendars = _.map(this.getCalendars(), function(calendar, index){
      var style = {
        background: this.getBackgroundColor(calendar.get('backgroundColor')),
        color: calendar.get('foregroundColor')
      }

      return (
        <li style={style} key={calendar.id + '-header'}>
          <img src={this.getImage(calendar.id)}/>
          {calendar.get('summary')}
          {index === 0 ? '' :
            <a href="#" onClick={_.partial(this.props.removeCalendar, calendar.id)} className="icomatic cancel">cancel</a>}
        </li>
      )
    }, this)

    return (
      <header>
        <ul className="calendar-list">
          {calendars}
        </ul>
      </header>
    )
  }

})

module.exports = AvailabilityHeader

