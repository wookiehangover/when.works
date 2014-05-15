/*globals Backbone, sinon, describe, it, runs, spyOn, expect, waitsFor,
    beforeEach, afterEach, before, after*/
define(function(require, exports, module){
  var assert = require('chai').assert;
  var Squire = require('squire');
  var injector = new Squire();
  var helper = require('test/helper');

  describe('untaken', function(){
    before(function(done){
      var self = this;
      // Stub out all of the module dependencies to prevent side-effects
      this.deps = helper.stubDependencies([
        'models/user',
        'collections/calendars',
        'collections/taken',
        'views/picker',
        'views/availability'
      ]);

      injector.mock(this.deps)
        .require(['untaken'], function(mockedUntaken){
          self.Untaken = mockedUntaken;
          done(); // Thanks Obama.
        });
    });

    after(function(){
      injector.clean();
    });

    it('exists', function(){
      assert.isDefined( this.Untaken );
    });

    xdescribe('initialize', function(){
      before(function(){
        this.untaken = new this.Untaken();
      });

      var modules = 'config user calendars availability picker output'.split(' ');

      modules.forEach(function(key){
        it('should create '+ key +' module', function(){
          assert.isDefined(this.untaken[key]);
        });
      });

      it('should pass the config instance to the Availability collection', function(){
        var stub = this.deps['collections/taken'].stub;
        var params = {
          config: this.untaken.config
        };
        assert.ok( stub.calledWith(params) );
      });

      it('should pass config and calendars instances to the Picker View', function(){
        var stub = this.deps['views/picker'].stub;
        var params = {
          collection: this.untaken.calendars,
          model: this.untaken.config
        };
        assert.ok( stub.calledWith(params) );
      });

      it('should pass a availbility colllection instance to the Availability View', function(){
        var stub = this.deps['views/availability'].stub;
        var params = {
          collection: this.untaken.availability,
        };
        assert.ok( stub.calledWith(params) );
      });

    });
  });

});
