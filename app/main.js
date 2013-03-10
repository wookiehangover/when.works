define(function(require, exports, module){

  var $ = require('jquery');
  var untaken = require('./untaken');

  $(function(){
    new untaken();
  });

});

