'use strict';

var sensorDriver = require('sensorjs').sensor,
    futureSensor,
    logger = require('log4js').getLogger('Main'),
    async = require('async'),
    _ = require('lodash');

var wot = require('./wot');

try {
  futureSensor = require('sensorjs-futuretek');
  sensorDriver.addSensorPackage(futureSensor);
} catch (e) {
  logger.warn('MODULES_NOT_SUPPORTED - sensorjs-futuretek');
}

function getSensors() {
  return function (req, res) {
    var collection = [];

    _.forEach(wot.sensors, function (sensorStore) {
      var result = {};

      result.id = sensorStore.sensor.id;
      result.type = sensorStore.type;
      result.value = sensorStore.latest;
      result.time = sensorStore.time;
      result.status = sensorStore.status;
      result.message = sensorStore.message;

      collection.push(result);
    });

    res.send(collection);
  }
}

function createSensor() {
  return function (req, res) {
    var sensorUrl = req.body.url || req.query.url,
        parsedSensorUrl,
        sensorId;

    if (sensorUrl) {
      parsedSensorUrl = sensorDriver.parseSensorUrl(sensorUrl);
      sensorId = parsedSensorUrl.id;

      if (wot.sensors[sensorId]) {
        res.status(409).send({
          id: sensorId,
          message: 'The sensor with ID is existing'
        });
        return;
      }

      wot.createSensor(sensorUrl, function (error, sensor) {
        if (error) {
          res.status(500).send(error);
        } else {
          logger.info('[routes/createSensor] sensor is created', sensorUrl);
          res.send({
            id: sensor.id
          });
        }
      });
    } else {
      res.status(400).send('[routes/getSensor] sensor url is required');
    }
  };
}

function getSensor() {
  return function (req, res) {
    var sensorUrl = req.body.url,
        sensorId = req.params.id,
        parsedSensorUrl,
        sensor,
        isNewSensorCreated = false;

    if (sensorId && !wot.sensors[sensorId]) {
      res.status(404).send('sensor is not existing - ' + sensorId);
      return;
    }

    if (sensorUrl) {
      parsedSensorUrl = sensorDriver.parseSensorUrl(sensorUrl);
      sensorId = parsedSensorUrl.id;
    }

    if (sensorId) {
      sensor = wot.sensors[sensorId] && wot.sensors[sensorId].sensor;

      async.series([
        function (done) {
          if (!sensor && sensorUrl) {
            logger.info('[routes/getSensor] sensor is not existing, so creating', sensorId);
            wot.createSensor(sensorUrl, function(error, createdSensor) {
              if (error) {
                done(error);
              } else {
                sensor = createdSensor;
                isNewSensorCreated = true;
                done();
              }
            });
          } else if (sensor) {
            logger.info('[routes/getSensor] sensor is existing', sensorId, sensor);
            done();
          } else {
            logger.error('[routes/getSensor] sensor url is required');
            done(new Error('sensor url is required'));
          }
        }
      ],
      function (error) {
        var result = {},
            sensorStore;

        if (error) {
          res.status(400).send(error);
          return;
        }

        if (sensor) {
          if (isNewSensorCreated) {
            sensor.once('data', function (data) {
              logger.info('[routes/getSensor] on data', data);

              if (data.status === 'ok') {
                result.id = data.id;
                result.type = _.keys(data.result)[0];
                result.value = _.values(data.result)[0];
                result.time = Date.now();
                result.status = 'ok';
              } else {
                result.status = 'error';
                result.id = data.id;
                result.message = data.message;
              }

              res.send(result);
            });
            sensor.listen(0);
          } else {
            sensorStore = wot.sensors[sensorId];

            result.id = sensor.id;
            result.type = sensorStore.type;
            result.value = sensorStore.latest;
            result.time = sensorStore.time;
            result.status = sensorStore.status;
            result.message = sensorStore.message;

            res.send(result);
          }
        }
      });
    } else {
      res.status(400).send('[routes/getSensor] sensor url or id is required');
    }
  };
}

function deleteSensor() {
  return function (req, res) {
    var sensorId = req.params.id,
        sensor;

    if (!wot.sensors[sensorId]) {
      res.status(404).send('sensor is not existing - ' + sensorId);
      return;
    }

    try {
      sensor = wot.sensors[sensorId] && wot.sensors[sensorId].sensor;
      sensor.clear();
      sensor = null;

      wot.sensors[sensorId] = null;
      delete wot.sensors[sensorId];

      logger.info('[deleteSensor] sensor is deleted', sensorId, wot.sensors[sensorId]);
      res.send('sensor is deleted - ' + sensorId);
    } catch (e) {
      logger.warn('[deleteSensor]', e);
      res.status(500).send('error on deleting the sensor - ' + sensorId);
    }
  }
}

function discoverSensors() {
  return function (req, res) {
    var driverName = req.body.driverName;

    wot.discoverSensors(driverName, function (err, devices) {
      if (err) {
        logger.error('[routes/discoverSensors]', err);
        res.status(500).send(err);
      } else {
        logger.info('[routes/discoverSensors] discovered devices', err, devices);
        res.send(devices);
      }
    });
  };
}

function setActuator() {
  return function (req, res) {
    var actuatorUrl = req.body.url,
        command = req.body.command,
        options = req.body.options,
        actuator;

    actuator = sensorDriver.createSensor(actuatorUrl);

    logger.info('[setActuator]', actuatorUrl, command, options);

    actuator.set(command, options, function (err, result) {
      logger.info('[setActuator] result of command', err, result);

      res.send(result);

      if (_.isObject(options) && options.duration) {
        setTimeout(function () {
          logger.info('[setActuator] clearing actuator after ', options.duration);
          actuator.clear();
          actuator = null;
        }, options.duration);
      } else {
        logger.info('[setActuator] clearing actuator now');
        actuator.clear();
        actuator = null;
      }
    });
  };
}

exports.getSensors = getSensors;
exports.getSensor = getSensor;
exports.discoverSensors = discoverSensors;
exports.createSensor = createSensor;
exports.deleteSensor = deleteSensor;
exports.setActuator = setActuator;