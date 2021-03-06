/*jshint asi:true */
exports.google = {
  id: process.env.GOOGLE_ID || '',
  secret: process.env.GOOGLE_SECRET || ''
}

exports.secret = process.env.SECRET || ''

exports.less = {
  src: './public/less'
}

exports.redis = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379
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

exports.cacheExpires = parseInt(process.env.CACHE_EXPIRES, 10) || 1;
