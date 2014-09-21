var rewire = require('rewire');
var assert = require('chai').assert;
var sinon = require('sinon');
var fixtures = require('../fixtures');

var user = rewire('../../routes/user');

describe('User routes', function(){

  beforeEach(function(){
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function(){
    this.sinon.restore();
  });

  describe('refreshToken', function(){
    beforeEach(function(){
      this.req = {
        session: fixtures.userSessionData.session
      };
      this.res = {
        send: this.sinon.stub(),
        client: { get: this.sinon.stub() }
      };
    });

    it('responds with a 403 without a valid user', function(){
      user.refreshToken({}, this.res);
      assert.ok(this.res.send.calledWith(403));
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

    context('successful token refresh', function(){
      beforeEach(function(){
        this.req.headers = {};
        this.req.user = { data: fixtures.user };
        this.req.session = { user: { data: fixtures.user } };
        this.res.client.get.callsArgWith(1, null, 'foobar');
        this.renew = this.sinon.stub();
        user.__set__('renew', this.renew);
        this.renew.callsArgWith(2, null, { "access_token": "foobar"});
        this.req.session.save = this.sinon.stub();
        this.req.query = {};
      });

      it('should set the session with the new user token', function(){
        user.refreshToken(this.req, this.res);
        assert.equal(this.req.session.user.token, 'foobar');
        assert.ok(this.req.session.save.called);
      });

      it('responds with a 403 if session write fails', function(){
        this.req.session.save.callsArgWith(0, true);
        user.refreshToken(this.req, this.res);
        assert.ok(this.res.send.calledWith(403));
      });

      context('session write successful', function(){
        beforeEach(function(){
          this.req.session.save.callsArgWith(0, null);
        });

        it('responds with a 200', function(){
          user.refreshToken(this.req, this.res);
          assert.ok(this.res.send.calledWith(200));
        });

        it('redirects to the provided query', function(){
          this.req.query.redirect = '/foobar';
          this.res.redirect = this.sinon.stub();
          user.refreshToken(this.req, this.res);
          assert.ok(this.res.redirect.calledWith('/foobar'));
        });
      });
    });


  });

});

