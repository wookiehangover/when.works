define(function(require, exports, module){

  var $ = require('jquery');
  var Untaken = require('./untaken');

  $(function(){
    new Untaken();
  });

});

