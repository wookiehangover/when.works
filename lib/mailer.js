var _ = require('lodash');
var conf = require('config');
var moment = require('moment-timezone');
var client = require('./database').redis;

var Promise = require('bluebird');
var formatPostBody = require('./format-api-post');
var renew = Promise.promisify(require('./renew-token'));
var post = Promise.promisify(require('request').post);

var Backbone = require('backdash');
var User = require('../models/user');

var fs = require('fs');
var tmpl = _.template(fs.readFileSync(__dirname + '/../views/mailers/daily-digest.ejs'));

var Config = require('../app/models/config');
var Availability = require('../app/collections/availability').extend({
  initialize: function() {},
  reload: function() {}
})

var mandrill = require('mandrill-api/mandrill');
var mandrillClient = new mandrill.Mandrill(conf.mandrill);

function Mailer(id) {
  this.id = id;
  this.start = moment().startOf('day');
  this.end = moment().endOf('day');

  // Promises are dumb sometimes
  _.bindAll(this, [
    'getFreebusy',
    'formatAvailability',
    'formatMessage',
    'sendMail',
    'storeMessage'
  ])
}

// 1 - Fetch the User

Mailer.prototype.getUser = function() {
  console.log('\t- Fetching User')
  return User.get(this.id).run()
    .then(function(user) {
      if (user.settings && user.settings.timezone) {
        this.start = moment().tz(user.settings.timezone).startOf('day');
        this.end = moment().tz(user.settings.timezone).endOf('day');
        console.log(this.start.format(), this.end.format())
      }
      this.user = user;
      return user;
    }.bind(this))
}

// 2 - Get the User's freebusy API response

Mailer.prototype.getFreebusy = function() {
  if (!this.user) {
    throw new Error('Invalid user');
  }

  if ( !(this.start && this.end) ) {
    throw new Error('Invalid start and end times');
  }

  if (!this.user.settings || !this.user.settings.calendars) {
    throw new Error('No calendars configured for digest');
  }

  var params = {
    url: 'https://www.googleapis.com/calendar/v3/freeBusy',
    json: formatPostBody({
      timeMin: this.start,
      timeMax: this.end,
      calendars: this.user.settings.calendars
    }),
    headers: {
      Authorization: 'Bearer '+ this.user.token
    }
  };

  console.log('\t- Requesting Calendars API')
  return post(params)
    .spread(function(resp, body) {
      if (resp.statusCode === 401) {
        return this.revalidateToken()
      }

      this.freebusy = body;
      return body;
    }.bind(this))
}

// 2b - Attempt to update our access token if the API response 401's

Mailer.prototype.revalidateToken = function() {
  var user = this.user;
  if (!user) {
    throw new Error('Invalid user');
  }

  if (!this._attempts) {
    this._attempts = 1;
  }

  console.log('\t- Revalidating access token')
  return renew(client, { data: user })
    .then(function(tokenResp) {
      // save the user's token
      user.token = tokenResp.access_token
      return user.save();
    })
    .then(function() {
      this._attempts += 1;
      // take another turn around the bend with the good creds we have

      return this.getFreebusy();
      // we should probably keep track of retries... even though it *should*
      // work every time
    }.bind(this));
}

// 3 - Format the User's availability data

Mailer.prototype.formatAvailability = function (freebusy) {
  if (!this.user) {
    throw new Error('Invalid user')
  }

  if ( !(this.start && this.end) ) {
    throw new Error('Invalid start and end times');
  }

  var timezone = this.user.settings.timezone;
  if (!timezone) {
    throw new Error('Invalid timezone');
  }

  var config = new Config({
    timezone: 'America/Denver',
    calendars: _.keys(freebusy.calendars),
    timeMin: this.start,
    timeMax: this.end
  }, {
    user: new Backbone.Model({ email: '' })
  });

  this.availability = new Availability(null, {
    config: config,
    calendars: new Backbone.Model()
  });

  this.availability.add( this.availability.parse(freebusy) )

  console.log('\t- Formatting API response')
  return this.availability.getAvailableTimes([])
}

// 4 - Format the availability data into a transactional email

Mailer.prototype.formatMessage = function(times) {
  if (!this.user) {
    throw new Error('Invalid user')
  }

  if ( !(this.start && this.end) ) {
    throw new Error('Invalid start and end times');
  }

  if (!this.freebusy) {
    throw new Error('Invalid freebusy response')
  }

  return {
    html: tmpl({
      name: this.user.given_name,
      times: times
    }),
    subject: "when.works for " + this.start.format('dddd M/D'),
    to: [{
      name: this.user.name,
      email: this.user.email,
      type: 'to'
    }],
    from_email: 'today@when.works',
    from_name: 'When.Works',
    track_opens: true
  }
}

// 5 - Fire off an email through the Manrill API

Mailer.prototype.sendMail = function(message) {
  return new Promise(function(fulfill, reject) {
    console.log('\t- Delivering message')
    // Gross mandrill API
    mandrillClient.messages.send({
      message: message,
      async: true,
      ip_pool: 'Main Pool'
    }, function(result) {
      // we might want to save this reciept somewheres.
      console.log(result)
      fulfill(result)
    }, function(err) {
      console.log(err)
      reject(err)
    })
  })

}

// 5b - Stash our email in the db in case we ever need it later

Mailer.prototype.storeMessage = function() {
  throw new Error('Not implemented')
}

// Start the Promise Party

Mailer.prototype.init = function() {
  console.log('Creating digest email for user: %s', this.id);
  return this.getUser()
    .then(this.getFreebusy)
    .then(this.formatAvailability)
    .then(this.formatMessage)
    .then(this.sendMail)
    .catch(function(err) { // jshint ignore:line
      console.error(err)
      console.error(err.stack)
    })
}

module.exports = function(id) {
  return new Mailer(id);
};
