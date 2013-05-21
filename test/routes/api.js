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

    it('should error out if there\'s not a user', function(done){
      var req = {
        session: {}
      };

      api.calendars( req, {
        json: function( data, status ){
          assert.equal(data.error, 'Forbidden');
          assert.equal(status, 403);
          done();
        }
      });
    });

    it('should make a request to the google API', function(){
      var requireStub = sinon.stub();
      api.__set__('request', requireStub);
      api.calendars(fixtures.userSessionData);
      assert.ok( requireStub.called );
      var params = requireStub.args[0][0];
      assert.equal(params.headers.Authorization, 'Bearer '+ fixtures.userSessionData.session.user.token);
    });

    it('should call the responsehandler', function(done){
      api.__set__('request', function(params, cb){
        cb();
      });
      api.calendars(fixtures.userSessionData, {
        json: function(){
          done();
        }
      });
    });

  });


});
