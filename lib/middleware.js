/*
 * Middleware
 */

var express = require('express');
var path = require('path');
var config = require('config');
var redisClient = require('./database').redis;

var lessMiddleware = require('./process-less')(config.less);
var jsMiddleware = require('./process-js');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var compress = require('compression');

module.exports = function(app) {
  app.use(logger('dev'));
  app.use(compress());
  app.use(bodyParser());
  app.use(cookieParser( config.secret ));
  app.use(session({
    store: new RedisStore( config.redis ),
    cookie: { maxAge: (2592e5) }
  }));

  app.use(function(req, res, next){
    req.client = res.client = redisClient;
    next();
  });

  // frontend application
  app.use(jsMiddleware);
  app.use('/css', lessMiddleware);
  app.use('/app', express.static(path.join(__dirname, '..', 'app')));
  app.use(express.static(path.join(__dirname, '..', 'public')));
};
