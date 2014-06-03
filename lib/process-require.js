var config = require('config').requirejs;

/*
 * RequireJS Middleware
 *
 * Captures an incoming request for your production JavaScript bundle and
 * re-routes it to use require.js in dev mode.
 */
module.exports = function(req, res, next){
  if( process.env.NODE_ENV !== "production" && req.url === config.path){
    req.url = '/js/v2.js';
  }
  next();
};
