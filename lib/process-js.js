var config = require('config').browserify

module.exports = function(req, res, next){
  if (req.url === config.dev && process.env.NODE_ENV === "production") {
    req.url = config.prod;
  }
  next()
}
