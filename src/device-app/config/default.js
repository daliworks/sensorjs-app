'use strict';
var os = require('os'),
  path = require('path');

module.exports = {
  Init: {
    timeout: 5 * 60 * 1000, // 5min
  },
  Gateway: {
    name: os.hostname(),
    firstDelay: 5000,
    reportInterval: 60000,
    port: 8080,
    logBaseDir: '/var/log/sensorjs/'
  },
  Sensors: {
  }
};
