var config = require('config')
var thinky = require('thinky')(config.rethinkdb)

var Invite = thinky.createModel('Invite', {
  id: String,
  user: String,
  refresh: Boolean,
  availability: {
    _type: Array,
    'default': []
  },
  config: Object,
  blacklist: Array
})

Invite.ensureIndex('user')

module.exports = Invite

