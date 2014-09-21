var config = require('config')
var thinky = require('thinky')(config.rethinkdb)

var User = thinky.createModel('User', {
  id: String,
  settings: Object,
  daily_digest: Boolean
})

User.ensureIndex('daily_digest')

module.exports = User
