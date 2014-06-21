var _ = require('lodash');
var assert = require('chai').assert;
var Backbone = require('backdash');
var Config = require('models/config');
var moment = require('moment');
var Availability = require('collections/availability');
var fixtures = require('../fixtures');

describe('collections/availability', function(){
  beforeEach(function() {
    this.config = new Config(null, {
      user: new Backbone.Model(fixtures.user)
    });
    this.calendars = new Backbone.Collection();

    this.deps = {
      config: this.config,
      calendars: this.calendars
    };
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
    beforeEach(function(){
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
});


