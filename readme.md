# when.works

> Find time for your next meeting, fast.

[![wercker status](https://app.wercker.com/status/d69047196b8bc67bdf6328ae92df19a5/m "wercker status")](https://app.wercker.com/project/bykey/d69047196b8bc67bdf6328ae92df19a5)

This app connects to a user's Google Calendar account and returns a
listing of what time's they're availabile for a given date range. I
found myself doing this manually quite often, so I made a small app to
do it for me.

## Setup

* Node.js >= 0.10
* Redis >= 2.4
* Grunt >= 0.4

`config/default.js` and `config/production.js` are not checked into the
repo. Take a look at `config/config-example.js` for what should go in
there.

### Install

```
$ npm install
```

### Run tests

```
$ npm test
```

### Browserify builds

```
$ npm run watch
```

### FE test builds

```
$ npm run watch-tests
```

### Building for production

```
$ make build
```

