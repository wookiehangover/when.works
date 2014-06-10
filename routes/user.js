var _ = require('lodash');
var cache = require('../lib/cacheman');
var config = require('config');
var request = require('request');

/*
 * GET users listing.
 */

exports.me = function(req, res){
  var user = req.session.user;
  if(!user){
    return res.json({ error: 'Forbidden' }, 403);
  }

  var presentedUser = _.omit( user.data, 'id' );

  cache.cacheResponse(req.client, req.url, presentedUser);
  res.json(presentedUser);
};

/*
 * GET destroy current session
 */

exports.logout = function(req, res){
  req.session.destroy(function(err){
    if(err){
      console.log(err);
      return res.error(500);
    }
    res.redirect('/');
  });
};

/*
 * Asks the Google API for a new token
 */

exports.refreshToken = function(req, res){
  var user = req.session.user;

  if (!user) {
    return res.send(403);
  }

  res.client.get('token:' + user.data.email, function(err, data){
    if (err || !data) {
      // console.log('Error: ' + err);
      return res.send(403);
    }

    var params = {
      url: 'https://accounts.google.com/o/oauth2/token',
      method: 'post',
      form: {
        client_id: config.google.id,
        client_secret: config.google.secret,
        refresh_token: data,
        grant_type: 'refresh_token'
      }
    };

    request(params, function(err, resp, body) {
      if (err) {
        // console.log('Error: ' + err);
        return res.send(403);
      }

      var json = parseBody(body);

      if (!json) {
        // console.log('Error parsing response body');
        return res.send(500);
      }

      req.session.user.token = json.access_token;

      req.session.save(function(err){
        if (err) {
          // console.log('Error: ' + err);
          return res.send(403);
        }

        if (req.query.redirect) {
          res.redirect(req.query.redirect);
        } else {
          res.send(200);
        }
      });
    });

  });
};

function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch(e) {
    return false;
  }
}
