define(['controllers/controllers', 'socketio', 'c3'],
  function(controllers, socketio, c3) {
    'use strict';
    controllers.controller('HomeCtrl', ['$scope', '$http', '$$log',
      function($scope, $http, $$log) {
        $$log.setCategory('HomeCtrl');

        var $$$ = {};

        $scope.$$$ = $$$;

        $$$.createdSensors = {};
        $$$.chartData = {};

        $scope.title = 'Home Controller';

        $scope.sensorUrls = [
          'sensorjs:///i2c/0x23/BH1750/BH1750-0x23',
          'sensorjs:///i2c/0x5c/BH1750/BH1750-0x5c',
          'sensorjs:///i2c/0x40/HTU21D/HTU21D-0x29'
        ];

        $scope.sensorDrivers = [
          'ds18b20',
          'futureSensor'
        ];

        $scope.actuatorUrls = [
          'sensorjs:///gpio/45/rgbLed/rgbLed-45',
          'sensorjs:///gpio/46/rgbLed/rgbLed-46',
          'sensorjs:///gpio/45/rgbLed/rgbLed-47'
        ];

        $scope.actuatorOptions = [
          '{ "duration": 4000 }',
          '{ "duration": 10000, "interval": 2000 }'
        ];

        function setupWebSocket() {
          var socketChannel;

          socketChannel = socketio.connect();

          socketChannel.on('connect', function () {
            $$log.info('WebSocket is connected', socketChannel.socket);

            socketChannel.on('sensorData', function (data) {
              var time = new Date(data.time);

              $$log.log('[WebSocket] on data', data);

              if (data && data.id) {
                $$$.createdSensors[data.id] = data;

                if (!$$$.chartData[data.id]) {
                  $$$.chartData[data.id] = {
                    id: data.id,
                    x: ['x'],
                    data: [data.id]
                  };
                }

                if ($$$.chartData[data.id].x.length > 50) {
                  $$$.chartData[data.id].x.splice(1,1);
                  $$$.chartData[data.id].data.splice(1,1);
                }

                $$$.chartData[data.id].x = $$$.chartData[data.id].x.concat([time]);
                $$$.chartData[data.id].data = $$$.chartData[data.id].data.concat([data.value]);

                c3.generate({
                  bindto: '#chart-' + data.id,
                  data: {
                    x: 'x',
                    columns: [
                      $$$.chartData[data.id].x,
                      $$$.chartData[data.id].data
                    ]
                  },
                  axis: {
                    x: {
                      type: 'timeseries',
                      tick: {
                        format: '%H:%M:%S'
                      }
                    }
                  }
                });

                $scope.$apply();
              }
            })
          });
        }

        $scope.setSensorUrl = function (url) {
          $scope.sensorUrl = url;
        };

        $scope.setSensorDriver = function (driver) {
          $scope.sensorDriverName = driver;
        };

        $scope.setActuatorUrl = function (url) {
          $scope.actuatorUrl = url;
        };

        $scope.setActuatorOption = function (option) {
          $scope.actuatorOption = option;
        };

        function getSensors() {
          $http.get('/api/sensors').
              success(function (data, status, headers, config) {
                $$log.info('[getSensors]', data, status, headers, config);
                $$$.sensorsList = data;
              }).
              error(function (data, status, headers, config) {
                $$log.error('[getSensors]', data, status, headers, config);
              });
        }

        function postSensor(sensorUrl, cb) {
          var body = {
            url: sensorUrl
          };

          $http.post('/api/sensors', body).
              success(function (data, status, headers, config) {
                $$log.info('[postSensor]', sensorUrl, data, status, headers, config);
                return cb && cb(null, data);
              }).
              error(function (data, status, headers, config) {
                if (status !== 409) {
                  $$log.error('[postSensor]', data, status, headers, config);
                } else {
                  $$log.warn('[postSensor]', data, status, headers, config);
                }

                return cb && cb(status, data);
              });
        }

        $scope.getSensorValue = function (sensorUrl) {
          postSensor(sensorUrl, function (err, data) {
            if (err && err !== 409) {
              $$log.error('[getSensorValue]', err, data);
            } else {
              $http.get('/api/sensors/' + data.id).
                  success(function (data, status, headers, config) {
                    $$log.info('[getSensorValue]', sensorUrl, data, status, headers, config);
                    $scope.sensorData = data;
                  }).
                  error(function (data, status, headers, config) {
                    $$log.error('[getSensorValue]', data, status, headers, config);
                  });
            }
          });
        }

        $scope.discoverSensors = function (sensorDriverName) {
          var body = {
            driverName: sensorDriverName
          };

          $http.post('/api/discoverSensors', body).
              success(function (data, status, headers, config) {
                $$log.info('[discoverSensors]', sensorDriverName, data, status, headers, config);
                $scope.discoveredDevices = data;
              }).
              error(function (data, status, headers, config) {
                $$log.error('[discoverSensors]', data, status, headers, config);
              });
        }

        $scope.setActuator = function (actuatorUrl, command, options) {
          var body = {
            url: actuatorUrl,
            command: command,
            options: options && typeof options === 'string' ? JSON.parse(options) : options
          };

          $$log.info('[setActuator]', actuatorUrl, command, options, body);

          $http.post('/api/setActuator', body).
              success(function (data, status, headers, config) {
                $$log.info('[setActuator]', actuatorUrl, data, status, headers, config);
                $scope.actuatorResult = data;
              }).
              error(function (data, status, headers, config) {
                $$log.error('[setActuator]', data, status, headers, config);
              });
        }

        function deleteSensor(sensorId) {
          $$$.createdSensors[sensorId] = null;
          delete $$$.createdSensors[sensorId];

          _.remove($$$.sensorsList, { id: sensorId });

          $$$.chartData[sensorId] = null;
          delete $$$.chartData[sensorId];
        }

        $scope.deleteSensor = function (sensorId) {
          $http.delete('/api/sensors/' + sensorId).
              success(function (data, status, headers, config) {
                $$log.info('[deleteSensor] sensor is removed', sensorId, data, status, headers, config);

                deleteSensor(sensorId);
              }).
              error(function (data, status, headers, config) {
                $$log.error('[deleteSensor] sensor is not removed', sensorId, data, status, headers, config);
              });
        };

        $scope.refreshSensors = function () {
          getSensors();
        };

        setupWebSocket();
        getSensors();
      }
    ]);
  }
);
