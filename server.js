
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var RedisStore = require('connect-redis')(express);
var config = require('config');

var routes = require('./routes');
var user = require('./routes/user');
var api = require('./routes/api');

var authom = require('./lib/authom');

var app = express();

var lessMiddleware = require('./lib/process-less')(config.less);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser( config.secret ));
  app.use(express.session({ store: new RedisStore() }));
  app.use(app.router);

  // frontend application
  app.use('/app', express.directory(path.join(__dirname, 'app')));
  app.use('/app', express.static(path.join(__dirname, 'app')));

  app.use('/css', lessMiddleware);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/calendars', api.calendars);
app.get('/untaken', api.freebusy);
app.get('/me', user.me);
app.get('/auth/:service', authom.app);

app.get('/logout', function(req, res){
  req.session = null;
  res.redirect('/');
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
