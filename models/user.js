var config = require('config')
var thinky = require('thinky')(config.rethinkdb)

var User = thinky.createModel('User', {
  id: String,
  settings: Object
})

module.exports = User
