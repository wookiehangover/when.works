define([
  'test/untaken-spec',
  'test/collections/taken-spec'
],function(){
  if( window.mochaPhantomJS ){
    window.mochaPhantomJS.run();
  } else {
    window.mocha.run();
  }
});
