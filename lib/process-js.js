var config = require('config').browserify

/*
 * RequireJS Middleware
 *
 * Captures an incoming request for your production JavaScript bundle and
 * re-routes it to use require.js in dev mode.
 */
module.exports = function(req, res, next){
  if (req.url === config.dev && process.env.NODE_ENV === "production") {
    req.url = config.prod;
  }
  next()
}
