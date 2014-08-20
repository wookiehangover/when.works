/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

var CalendarTable = React.createClass({

  render: function() {
    if (this.props.availability.length === 0) {
      return <span></span>;
    }
    var intervals = this.props.intervals;

    return (
      <table className="calendar-grid">
        <thead>
          <tr>
            <td></td>
            <td>{this.props.days[0]}</td>
            <td>{this.props.days[1]}</td>
            <td>{this.props.days[2]}</td>
            <td>{this.props.days[3]}</td>
            <td>{this.props.days[4]}</td>
          </tr>
        </thead>
        <tbody>
          {_.map(this.props.rows, function(dayblock, i) {
            var label = /30/.test(intervals[i]) ? '': intervals[i];
            var rowKey = _.uniqueId('row' + i);
            var labelKey = _.uniqueId(label);
            return (
              <tr key={rowKey}>
                <td className="label" key={labelKey}>{label}</td>
                {_.map(dayblock, function(cell, j) {
                  var day = this.props.days[j];
                  var key = _.uniqueId("cell" + i + j );
                  var className = cell.booked ? "booked" : "free";
                  return <td className={className} key={key} onClick={_.partial(this.props.onClick, cell)}></td>
                }, this)}
              </tr>
            )
          }, this)}
        </tbody>
      </table>
    )
  },
});

module.exports = CalendarTable
