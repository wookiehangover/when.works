var config = require('config');

// Middleware for serving cached responses
exports.checkCache = function(req, res, next) {
  var cacheKey = createKey(req.url);

  req.client.get(cacheKey, function(err, cached){
    if (err) {
      console.log('Error ' + err);
      return res.send(500);
    }

    cached = parseCachedResponse(cached);

    if (cached) {
      console.log('Cache Hit: '+ cacheKey +' '+ new Date() );
      if (req.url === '/auth/google') {
        req.sesssion.user = cached;
      }
      res.json(cached);
    } else {
      next();
    }
  });
};

// Writes response data for a given key to the redis client
exports.cacheResponse = function(client, url, data) {
  if (data.length === 0 || !url) {
    return;
  }

  var key = createKey(url);

  client.multi()
    .set(key, JSON.stringify(data))
    .expire(key, config.cacheExpires)
    .exec(function() {
      console.log('Cache Write: '+ key +' '+ new Date());
    });
};

var crypto = require('crypto');

function createKey(url) {
  var hash = crypto.createHash('md5');
  hash.update(typeof url === 'string' ? url : url.path);
  return 'cache:' + hash.digest('base64');
}

// try/catch wrapper for parsing JSON respons body
function parseCachedResponse(cache) {
  if (!cache) {
    return false;
  }
  try {
    return JSON.parse(cache);
  } catch(e) {
    return false;
  }
}


