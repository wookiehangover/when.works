#!/usr/bin/env node

var mailer = require('../lib/mailer')
var User = require('../models/user')
var Promise = require('bluebird')

User.filter({ daily_digest: true }).withFields('id', 'email').run()
  .then(function(res) {

    Promise.all(res.map(function(user) {
      var email = mailer(user.id)
      return email.init()
    }))
      .then(function() {
        console.log('Daily Digests Delivered!');
        process.exit(0)
      })
      .catch(function(err) {
        console.error('Error processing things!')
        console.error(err);
        process.exit(1)
      })
  })

