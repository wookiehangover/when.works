/*globals sinon*/
define(function(require, exports, module){

  exports.stubDependencies = function(deps){
    if( !(deps && deps.forEach) ){
      throw new TypeError('I need an Array!');
    }
    var stubbedDeps = {};
    deps.forEach(function(dep){
      var stub = sinon.stub();
      function StubConstructor(){
        return stub;
      }
      StubConstructor.stub = stub;
      stubbedDeps[dep]= StubConstructor;
    });
    return stubbedDeps;
  };

});
