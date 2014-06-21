var _ = require('lodash');

exports.request = function( o ){
  return _.defaults( o || {}, {

    body: {},

    params: {}

  });
};

exports.response = function( cb ){
  return {

    render: function( path, context ){
      return cb.apply( this, arguments );
    },

    send: function( res, code ){
      return cb.apply( this, arguments );
    },

    redirect: function( path ){
      return cb.apply( this, arguments );
    },

    json: function( data, code ){
      return cb.apply(this, arguments);
    }

  };
};

exports.userSessionData = {
  session: {
    user: {
      token: 'hello world'
    }
  }
};

exports.user = {
  "id": "108809895309028249408",
  "email": "sam@quickleft.com",
  "verified_email": true,
  "name": "Samuel Breed",
  "given_name": "Samuel",
  "family_name": "Breed",
  "link": "https://plus.google.com/108809895309028249408",
  "picture": "https://lh4.googleusercontent.com/-q_eJOQjuaM4/AAAAAAAAAAI/AAAAAAAAABE/UB6OIPpqEr8/photo.jpg",
  "gender": "male",
  "locale": "en",
  "hd": "quickleft.com"
};



