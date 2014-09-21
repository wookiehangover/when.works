/*jshint asi:true */
exports.google = {
  id: process.env.GOOGLE_ID || '702998348467-e12ou78ulm21qb3ro61e3sdobnleg2cg.apps.googleusercontent.com',
  secret: process.env.GOOGLE_SECRET || 'Y6tZJV_X3Rgz_IB6e7qpLzCP'
}

exports.secret = process.env.SECRET || 'heynow'

exports.less = {
  src: './public/less'
}

exports.redis = {
  host: process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1',
  port: process.env.REDIS_PORT_6379_TCP_PORT || 6379
}

exports.rethinkdb = {
  host: process.env.RETHINKDB_PORT_28015_TCP_ADDR,
  port: process.env.RETHINKDB_PORT_28015_TCP_PORT,
}

if( process.env.REDIS_PASS ){
  exports.redis.pass = process.env.REDIS_PASS
}

exports.requirejs = {
  path: '/js/untaken.js',
  source: '/app/components/requirejs/require.js'
}

exports.browserify = {
  dev: '/js/untaken.js',
  prod: '/js/untaken.min.js'
}

exports.mandrill = process.env.MANDRILL_KEY;

exports.cacheExpires = parseInt(process.env.CACHE_EXPIRES, 10) || 1;
