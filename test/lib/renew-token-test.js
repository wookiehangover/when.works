var rewire = require('rewire');
var assert = require('chai').assert;
var sinon = require('sinon');

var renew = require('../../lib/renew-token');

describe('Token Renewal helper', function() {

  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.request = this.sinon.stub();
    renew.__set__('request', this.request);
  })

  afterEach(function() {
    this.sinon.restore();
  })

  it('initiates a request for a new token when a valid token is present', function(done){
    renew(this.client, 'user', done);
    assert.ok(this.request.called);
    var args = this.request.getCall(0).args;
    assert.ok(args[0].form.refresh_token, 'helloworld');
  });

  context('error getting token', function(){
    beforeEach(function() {
      this.req.user = { data: fixtures.user };
    })
    it('responds with a 500 if redis errors', function(){
      this.res.client.get.callsArgWith(1, true);
      user.refreshToken(this.req, this.res);
      assert.ok(this.res.send.calledWith(500));
    });

    it('responds with a 500 if the token is falsy', function(){
      this.res.client.get.callsArgWith(1, null, false);
      user.refreshToken(this.req, this.res);
      assert.ok(this.res.send.calledWith(500));
    });
  });




})
