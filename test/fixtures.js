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
