var _ = require('lodash');
var conf = require('config');
var moment = require('moment');
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

// Custom Error for handling bad tokens
function InvalidCredentials(msg) {
  this.name = 'InvalidCredentials';
  this.message = msg || '401 - Invalid Credentials';
}
InvalidCredentials.prototype = Object.create(Error.prototype);

// Automatically renew a user's access token
function revalidateToken(user) {
  return function() {
    return renew(client, { data: user })
      .then(function(tokenResp) {
        // save the user's token
        user.token = tokenResp.access_token
        return user.save();
      })
      .then(function() {
        // take another turn around the bend with the good creds we have
        return getFreebusy(user);
        // we should probably keep track of retries... even though it *should*
        // work every time
      });
  }
}

// API request for freebusy
function getFreebusy(user) {
  var start = moment().startOf('day')
  var end = moment().endOf('day')

  // TODO -- this requires DB persistence
  var calendars = user.settings.calendars;

  if (!calendars) {
    throw new Error('No calendars configured for digest');
  }

  var params = {
    url: 'https://www.googleapis.com/calendar/v3/freeBusy',
    json: formatPostBody({
      timeMin: start,
      timeMax: end,
      calendars: calendars
    }),
    headers: {
      Authorization: 'Bearer '+ user.token
    }
  };

  return post(params)
    .spread(function(resp, body) {
      if (resp.statusCode === 401) {
        throw new InvalidCredentials();
      }

      body.timeMin = start;
      body.timeMax = end;
      body.user = user;

      return body;
    })
    .catch(InvalidCredentials, revalidateToken(user));
}

// Format the user's availability
function getAvailability(freebusy) {
  var config = new Config({
    timezone: 'America/Denver',
    calendars: _.keys(freebusy.calendars),
    timeMin: freebusy.timeMin,
    timeMax: freebusy.timeMax
  }, {
    user: new Backbone.Model({ email: '' })
  });

  var availability = new Availability(null, {
    config: config,
    calendars: new Backbone.Model()
  });

  availability.add(availability.parse(freebusy))
  var times = availability.getAvailableTimes([])

  return {
    freebusy: freebusy,
    times: times,
  }
}

// Fire off an email of the available times
function sendMail(resp) {
  var message = {
    html: tmpl({
      name: resp.freebusy.user.given_name,
      times: resp.times
    }),
    subject: "when.works for " + resp.freebusy.timeMin.format('dddd M/D'),
    to: [{
      name: resp.freebusy.user.name,
      email: resp.freebusy.user.email,
      type: 'to'
    }],
    from_email: 'today@when.works',
    from_name: 'When.Works',
    track_opens: true
  }

  // Gross mandrill API
  mandrillClient.messages.send({
    message: message,
    async: true,
    ip_pool: 'Main Pool'
  }, function(result) {

    // we might want to save this reciept somewheres.
    console.log(result)
  }, function(err) {
    throw err
  })
}

module.exports = function(id) {
  return User.get(id).run()
    .then(getFreebusy)
    .then(getAvailability)
    .then(sendMail)
    .catch(function(err) {
      console.error(err)
      console.error(err.stack)
    })
};
