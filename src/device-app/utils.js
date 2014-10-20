'use strict';
var events = require('events'),
  logger = require('log4js').getLogger('Utils'),
  util = require('util'),
  exec = require('child_process').exec,
  async = require('async'),
  getMac =  require('getmac').getMac;


function Monitor() {
  events.EventEmitter.call(this);
}
util.inherits(Monitor, events.EventEmitter);

module.exports.monitor = new Monitor();

module.exports.statusError = function statusError(statusCode, message) {
  var e = new Error(message ? (statusCode + ' ' + message) : statusCode.toString());
  e.statusCode = statusCode;
  return e;
};

module.exports.isValidTime = function (time) {
  if (!time) {
    time = Date.now();
  }
  return time > 1388502000000;// later than Jan 1, 2014
};

var _mac, _macFs, _serial; //saved for later reference
function getId(type, cb) {
  var id;
  
  if (!type) {
    type = 'mac';
  }

  switch (type) {
  case 'mac':
    if (_mac) { return cb(null, _mac); }
    getMac(function (err, addr) {
      if (!err && addr) {
        id = addr.toString().replace(/:/g, '').toLowerCase();
        _mac = id;
      }
      return cb(err, id);
    });
    break;
  case 'mac+filesystem':
    if (_macFs) { return cb(null, _macFs); }
    exec('blkid -t LABEL=rootfs -s UUID -o value', 
      { timeout: 5000, killSignal: 'SIGKILL' },
    function (err, stdout) {
      if (!err && stdout) {
        id = id + stdout.toString().trim();
        id.replace(/-/g, '');
        id = parseInt(id, 16).toString(36);
        _macFs = id;
      }
      return cb(err, id);
    });
    break;
  case 'bbbserial':
    if (_serial) { return cb(null, _serial); }
    exec('hexdump -e \'8/1 \"%c\"\' /sys/bus/i2c/devices/0-0050/eeprom -s 16 -n 12', 
      { timeout: 5000, killSignal: 'SIGKILL' },
    function (err, stdout) {
      if (!err && stdout) {
        id  = stdout.toString().trim();
        _serial = id;
      }
      return cb(err, id);
    });
    break;
    
  default:
    return cb(new Error('unknown type', type));
  }
}
module.exports.getId = getId;

var _board;
module.exports.getBoardInfo = function (cb) {

  if (_board) { 
    return cb(null, _board); 
  } else {
    _board = {};
  }

  var timer = setTimeout(function () {
    logger.error('[getBoardInfo] blocked', _board); 
    timer = null;
    return cb && cb(null, _board);
  }, 1000); // 1sec

  async.series([
    function (done) { //get mac
      getId('mac', function (err, id) {
        if (!err && id) {
          _board = {
            macaddress: id,
          };
        }
        return done();
      });
    }, function (done) {//bbb specific, ignore error
      exec('hexdump -e \'8/1 \"%c\"\' /sys/bus/i2c/devices/0-0050/eeprom -s 4 -n 24', 
        { timeout: 5000, killSignal: 'SIGKILL' },
      function (err, stdout) {
        if (!err && stdout) {
          var rom  = stdout.toString().trim();
          _board.model = rom.substring(0,8);
          _board.rev = rom.substring(8,12);
          _board.serial = rom.substring(12,24);
        } 
        return done();
      });
    }
  ], function (err) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      return cb && cb(err, _board);
    } else {
      logger.error('[getBoardInfo] timeout', _board); 
    }
  });
};
