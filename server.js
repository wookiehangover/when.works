
/*
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var RedisStore = require('connect-redis')(express);
var config = require('config');

/*
 * Application Routes
 */
var routes = require('./routes');
var user = require('./routes/user');
var api = require('./routes/api');

/*
 * Custom Middleware
 */
var authom = require('./lib/authom');
var lessMiddleware = require('./lib/process-less')(config.less);
var requireMiddleware = require('./lib/process-require');

/*
 * Application init
 */
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser( config.secret ));
  app.use(express.session({ store: new RedisStore( config.redis ) }));
  app.use(app.router);

  // frontend application
  app.use(requireMiddleware);
  app.use('/css', lessMiddleware);
  app.use('/app', express.directory(path.join(__dirname, 'app')));
  app.use('/app', express.static(path.join(__dirname, 'app')));

  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 * Route Map
 */

app.get('/', routes.index);
app.get('/auth/:service', authom.app);
app.get('/calendars', api.calendars);
app.get('/untaken', api.freebusy);
app.get('/me', user.me);
app.get('/logout', user.me);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
