define(['react'], function(React) {


  var TimeEntry = React.createClass({
    render: function(){
      return (
        <li className="topcoat-list__item" data-orig-index="<%= i %>">
          <p>{this.props.time}</p>
          <button className="topcoat-button" data-action="remove-item">remove</button>
        </li>
      )
    }
  })

  return React.createClass({
    render: function(){
      var times = this.props.availability.getUntaken().map(function(time){
        return (
          <TimeEntry time={time} />
        )
      });

      return (
        <div className="topcoat-list__container">
          <h3 className="topcoat-list__header">Here is when you are available:</h3>
          <ul className="topcoat-list">
          {times}
          </ul>
        </div>
      );
    }
  });

});
