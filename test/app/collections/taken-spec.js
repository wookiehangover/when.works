/*globals Backbone, sinon, describe, it, runs, spyOn, expect, waitsFor,
    beforeEach, afterEach, before, after*/
var assert = require('chai').assert;
var fixtures = require('../fixtures');
var Config = require('models/config');
var TakenCollection = require('collections/availability');

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

  describe('url', function(){
    it('should assemble a well-formed querystring from config data', function(){
      var config = new Config();
      var taken = new TakenCollection([], { config: config });
      assert.equal(taken.url(), '/api/freebusy?calendars=[sam%40quickleft.com]&timeMin=2013-05-12T00%3A00%3A00-06%3A00&timeMax=2013-05-20T00%3A00%3A00-06%3A00');
    });
  });
});


