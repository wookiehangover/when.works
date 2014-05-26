
/*
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var config = require('config');
var authom = require('./lib/authom');
var middleware = require('./lib/middleware');

var app = express();

middleware(app);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


/*
 * Routes
 */

var routes = require('./routes');
var user = require('./routes/user');
var api = require('./routes/api');

app.get('/', routes.index);
app.get('/auth/:service', api.checkCache, authom.app);


app.get('/api/calendars', api.checkCache, api.calendars);
app.get('/api/freebusy', api.checkCache, api.freebusy);

app.get('/me', api.checkCache, user.me);
app.get('/logout', user.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
