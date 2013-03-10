var assert = require('assert');
var api = require('../../routes/api');


describe('Google API routes', function(){

  describe('calendars', function(){

    var req = {
      session: {}
    };

    it('should error out if there\'s not a user', function(done){
      api.calendars( req, {
        json: function( data, status ){
          assert.equal(data.error, 'Forbidden');
          assert.equal(status, 403);
          done();
        }
      });
    });

    it('should make a request', function(done){


    });
  });


});
