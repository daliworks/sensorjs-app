'use strict';

// External libraries
var express = require('express'),
    http = require('http'),
    errorHandler = require('errorhandler'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    optimist = require('optimist'),
    async = require('async'),
    log4js = require('log4js'),
    os = require('os'),
    CONFIG = require('config');

// Internal libraries
var wot = require('./wot'),
    utils = require('./utils'),
    routes = require('./routes');

// global variable
var gatewayId, _initialized = false;

// option parsing
var argv = optimist.usage('Sensorjs app', {
  'logger' : {
    description: 'logger configuration json',
    default: __dirname + '/logger_cfg.json',
    alias : 'l',
    string: true
  },
  'help' : {
    description : 'print help',
    alias : 'h'
  }
}).argv;

var env = process.env.NODE_ENV || 'development';

if (argv.h) {
  optimist.showHelp();
  process.exit(0);
}

// file logger init
log4js.configure(argv.logger, {reloadSecs: 30});

var logger = log4js.getLogger('Main');

logger.info('... Starting [%s] ...', os.hostname());

// Express web server setting
var app = express(),
    appServer = http.createServer(app);

app.set('port', CONFIG.Gateway.port || 80);
app.set('views', __dirname + '/da_views');
app.set('view engine', 'jade');
app.set('root', __dirname);
app.use(favicon(__dirname + '/../device-client/app/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(__dirname + '/../device-client/app'));

app.get('/api/sensors', routes.getSensors());
app.post('/api/sensors', routes.createSensor());
app.get('/api/sensors/:id', routes.getSensor());
app.delete('/api/sensors/:id', routes.deleteSensor());
app.post('/api/getSensorValue', routes.getSensor());
app.post('/api/discoverSensors', routes.discoverSensors());
app.post('/api/setActuator', routes.setActuator());

if ('development' === env) {
  app.use(errorHandler({ dumpExceptions: true }));
}

async.series([
  function (done) {
    logger.info('1. get mac');
    utils.getId('mac', function (err, id) {
      if (!err && id) {
        gatewayId = id;
        done();
      } else {
        done(new Error('failure to get id'));
      }
    });
  },
  function (done) {
    var options;

    logger.info('2. wot app init');

    options = {
      websocketTopic: 'sensorData'
    };

    wot.init(appServer, options, done);
  },
  function (done) {
    logger.info('3. sensor init');
    done();
  },
], function (err) {
  if (err) {
    logger.fatal('init error', err);
    setTimeout(function() {
      process.exit(1);
    }, 30*1000); // exit in 30secs
  }

  appServer.listen(app.get('port'));
  logger.warn('... Listening on port %s ...', app.get('port'));
  _initialized = true;
});

//process 
process.on('uncaughtException', function (err) {
  logger.error('[uncaughtException] ' + err.stack);
  //if (redLed) { redLed.blink(); } //blink at start initialization
});
process.on('exit', function () {
  logger.info('exit');
});
process.on('SIGTERM', function () {
  logger.info('SIGTERM');

  process.exit();
});