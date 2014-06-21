/*globals describe, it */
var rewire = require('rewire');
var assert = require('chai').assert;
var sinon = require('sinon');
var fixtures = require('../fixtures');

var api = rewire('../../routes/api');

describe('Google API routes', function(){

  it('exists', function(){
    assert.isDefined(api);
  });

  describe('calendars', function(){

    it('should make a request to the google API', function(){
      var requireStub = sinon.stub();
      api.__set__('request', requireStub);
      api.calendars(fixtures.userSessionData.session);
      assert.ok( requireStub.called );
      var params = requireStub.args[0][0];
      assert.equal(params.headers.Authorization, 'Bearer '+ fixtures.userSessionData.session.user.token);
    });

  });


});
