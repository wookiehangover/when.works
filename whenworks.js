var express = require('express');
var path = require('path');
var config = require('config');
var authom = require('./lib/authom');
var middleware = require('./lib/middleware');

var app = express();

middleware(app);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var routes = require('./routes');
var user = require('./routes/user');
var api = require('./routes/api');

app.get('/', routes.index);
app.get('/for/:email', routes.index);
app.get('/auth/:service', authom.app);

app.get('/api/calendars', api.requireUser, api.checkCache, api.calendars);
app.get('/api/freebusy', api.requireUser, api.checkCache, api.freebusy);

app.post('/api/invite', api.requireUser, api.createInvite);

app.get('/me', api.checkCache, user.me);
app.get('/logout', user.logout);
app.get('/refresh-token', user.refreshToken);

module.exports = app;
