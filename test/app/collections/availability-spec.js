var assert = require('chai').assert;
var _ = require('lodash');
var Backbone = require('backdash');
var moment = require('moment');
var sinon = require('sinon');

var Config = require('models/config');
var Availability = require('collections/availability');
var fixtures = require('../fixtures');

describe('collections/availability', function(){
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.config = new Config(null, {
      user: new Backbone.Model(fixtures.user)
    });
    this.calendars = new Backbone.Collection();

    this.deps = {
      config: this.config,
      calendars: this.calendars
    };

    this.availability = new Availability(fixtures.availabilitySet, this.deps);
    this.availability.stopListening();

    this.start = moment();
    this.end = moment().add('h', 1);
    this.times = [
      {
        start: this.start,
        end: moment().add('m', 30)
      },
      {
        start: moment().add('m', 15),
        end: this.end
      }
    ];
  })

  afterEach(function() {
    this.sinon.restore();
  })

  it('exists', function(){
    assert.isDefined( Availability );
  });

  describe('initialize', function(){
    ['config', 'calendars'].forEach(function(dep) {
      it('should throw without a '+ dep +' param', function(){
        assert.throws(function(){
          new Availability([], {});
        }, new RegExp(dep));
      });
    });
  });

  describe('url', function(){
    it('should assemble a well-formed querystring from config data', function(){
      var col = new Availability([], this.deps);
      assert.include(col.url(), '/api/freebusy');
    });
  });

  describe('mergeSort', function() {
    it('collapses 2 overlapping times into a single time', function() {
      var mergedTimes = this.availability.mergeSort(this.times);
      assert.equal(mergedTimes.length, 1);
      assert.equal(+mergedTimes[0].start, +this.start);
      assert.equal(+mergedTimes[0].end, +this.end);
    });

    it('is not affected by sort order', function() {
      this.times = this.times.reverse();
      var mergedTimes = this.availability.mergeSort(this.times);
      assert.equal(mergedTimes.length, 1);
      assert.equal(+mergedTimes[0].start, +this.start);
      assert.equal(+mergedTimes[0].end, +this.end);
    });

    it('ignores multiple overlapping times', function() {
      _.times(10, function(i){
        this.times.push({
          start: this.start.clone().add('m', 1 + i),
          end: this.start.clone().add('m', 15 + i)
        })
      }, this);

      var mergedTimes = this.availability.mergeSort(this.times);
      assert.equal(mergedTimes.length, 1);
      assert.equal(+mergedTimes[0].start, +this.start);
      assert.equal(+mergedTimes[0].end, +this.end);
    });
  });

  describe('getAvailableTimes', function() {
    it('should return an empty array without any calendar data', function() {
      this.availability.reset();
      var ret = this.availability.getAvailableTimes();
      assert.equal(ret.length, 0);
    });

    xit('should process a single calendar without a performing a mergeSort', function() {
      var cal = this.availability.first().id;
      var getDays = this.sinon.spy(this.availability, 'getDays');
      this.config.set('calendars', [cal]);
      var ret = this.availability.getAvailableTimes();
      assert.isTrue(getDays.calledWith(cal));
      assert.equal(ret.length, 12); // "magic" number from fixture data
    })

    it('should perform a mergeSort when handling multiple calendars', function() {
      var mergeSort = this.sinon.spy(this.availability, 'mergeSort');
      this.config.set('calendars', this.availability.pluck('id'));
      var ret = this.availability.getAvailableTimes();
      assert.isTrue(mergeSort.called);
      assert.equal(ret.length, 11);
    });

    xit('should filter blacklisted timeStrings', function() {
      this.config.set('calendars', [this.availability.first().id]);
      var times = this.availability.getAvailableTimes();
      var ret = this.availability.getAvailableTimes(times.slice(0, 5));
      assert.equal(ret.length, 7);
    });

    it('should not contain times after the configured beginning or end times', function() {
      this.availability.reset(fixtures.availabilityLargeSet);
      this.config.set('calendars', this.availability.pluck('id'));
      var ret = this.availability.getAvailableTimes().join(' ');
      console.log(ret)
      assert.isFalse(/9./.test(ret))
      assert.isFalse(/7./.test(ret))
    });
  })
});


