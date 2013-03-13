define(function(require, exports, module){

  var $ = require('jquery');
  var Untaken = require('./untaken');

  $(function(){

    $(document)
      .ajaxStart(function(){
        $('.loader-container').addClass('js-show');
      }).ajaxStop(function(){
        $('.loader-container').removeClass('js-show');
      });

    new Untaken();
  });

});
