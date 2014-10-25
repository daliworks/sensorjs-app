/*jshint expr: true, forin: false*/
/*global before: false, after: false, it: false, describe: false*/
'use strict';
var _ = require('lodash');

var wot = require('../wot');

var chai = require('chai'),
    expect = chai.expect;
chai.config.includeStack = true;

describe('Sensor CRUD', function () {
  var sensorNetwork = 'w1',
      sensorAddress = '28-000004ccea2d',
      sensorModel = 'ds18b20',
      sensorId = '28-000004ccea2d',
      sensorUrl = 'sensorjs:///' + [sensorNetwork, sensorAddress, sensorModel, sensorId].join('/');

  var sensor;

  before(function (done) {
    wot.init(null, null, done);
  });

  after(function (done) {
    if (sensor) {
      sensor.clear();
      sensor = null
    }

    if (wot.sensors[sensorId]) {
      wot.sensors[sensorId] = null;
      delete wot.sensors[sensorId];
    }

    done();
  });

  describe('Creating new sensor', function () {
    it('should create a sensor with sensor url', function (done) {
      wot.createSensor(sensorUrl, function (error, newSensor) {
        if (error) {
          console.log(error);
        } else {
          sensor = newSensor;

          expect(sensor).to.be.an('object');
          expect(sensor).to.have.property('id');
          expect(sensor.id).to.equal(sensorId);
          expect(sensor.model).to.equal(sensorModel);
          expect(sensor.info).to.be.an('object');
          expect(sensor.info.device).to.be.an('object');
          expect(sensor.info.device.sensorNetwork).to.equal(sensorNetwork);
          expect(sensor.info.device.address).to.equal(sensorAddress);
          done();
        }
      });
    });
  });

  describe('Getting sensor value', function () {
    it('should get a value from the created sensor', function (done) {
      sensor.once('data', function (data) {
        expect(data).to.be.an('object');
        expect(data.id).to.equal(sensorId);

        if (data.status === 'ok') {
          expect(_.values(data.result)[0]).to.exist;
        } else {
          expect(data.message).to.exist;
        }

        done();
      });
      //sensor.listen(0);
    });
  });

  describe('Deleting sensor', function () {
    it('should delete the created sensor', function (done) {
      sensor.clear();
      sensor = null;

      wot.sensors[sensorId] = null;
      delete wot.sensors[sensorId];

      expect(wot.sensors[sensorId]).to.not.exist;
      expect(sensor).to.not.exist;

      done();
    });
  });
});
