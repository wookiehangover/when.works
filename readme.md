# [when.works](https://when.works)

> Find time for your next meeting, fast.

[![wercker status](https://app.wercker.com/status/d69047196b8bc67bdf6328ae92df19a5/m "wercker status")](https://app.wercker.com/project/bykey/d69047196b8bc67bdf6328ae92df19a5)

This app connects to a user's Google Calendar account and returns a
listing of what time's they're availabile for a given date range. I
found myself doing this manually quite often, so I made a small app to
do it for me.

## Setup

**Prerequisites:**

* Node.js >= 0.10
* Redis >= 2.6
* Grunt >= 0.4

Install npm dependencies and runs a one-time browserify build.

```
$ make install
```

Run a development server and [Browserify](http://browserify.org/) watch
tasks. 

```
$ make watch
```

### Run tests

```
$ npm test
```

### Build for production

Minified production builds automatically created by wercker, but they
can be manually created and checked in for deployment.

```
$ make build
```

---

## CI

when.works uses [Wercker](http://wercker.com) for running tests,
building production and test assets, and deploying to production.

Click on the Wercker badge at the top of the readme to see build
statuses.

## Deploying with Wercker

Successful builds can be deployed to production from Wercker. Using the
[Wercker CLI](http://devcenter.wercker.com/articles/cli/):

```
wercker deploy
```

Follow the prompts to deploy your build.


