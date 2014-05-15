/*globals Backbone, sinon, describe, it, runs, spyOn, expect, waitsFor,
    beforeEach, afterEach, before, after*/
define(function(require, exports, module){
  var assert = require('chai').assert;
  var fixtures = require('test/fixtures');
  var Squire = require('squire');
  var TakenCollection = require('collections/taken');

  describe('collections/taken', function(){
    it('exists', function(){
      assert.isDefined( TakenCollection );
    });

    describe('initialize', function(){
      it('should throw without a config model', function(){
        assert.throws(function(){
          new TakenCollection([], {});
        }, /You must pass a config model/);
      });
    });

    xdescribe('url', function(){
      it('should assemble a well-formed querystring from config data', function(){
        var config = new Backbone.Model(fixtures.configData);
        var taken = new TakenCollection([], { config: config });
        assert.equal(taken.url(), '/api/freebusy?calendar=sam%40quickleft.com&timeMin=2013-05-12T00%3A00%3A00-06%3A00&timeMax=2013-05-20T00%3A00%3A00-06%3A00');
      });
    });
  });

});

