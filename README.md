## SensorJS App framework
See also [sensor.js](https://github.com/daliworks/sensorjs)

## Requirements

### Software
- node: v0.10.x

### Hardware
- Beaglebone Black (BBB)
- Sensors(Optional)
  - Temperature: DS18B20 (P9-12 pin)
  - Humidity: HTU21D
  - Light: BH1750
- Actuators(Optional)
  - RGB Led

## Install
1. Download the Debian image file for "BeagleBone Black (eMMC flasher)" from [the latest images page](http://beagleboard.org/latest-images).
2. Make a micro SD card with the downloaded image file.
  * Windows: Please refer the "[Update board with latest software](http://beagleboard.org/getting-started#update)" section in the [Getting Started page](http://beagleboard.org/getting-started) of [BeagleBone website](http://beagleboard.org).
  * OS X: Please refer the instructions in [this webpage](http://www.acme-dot.com/using-os-x-to-image-an-sd-card-with-debian-for-beaglebone-black/).
  * Linux:
  ```
  unxz bone-debian-7.7-console-armhf-2015-01-06-2gb.img.xz
  sudo dd if=./bone-debian-7.7-console-armhf-2015-01-06-2gb.img of=/dev/sdX
  ```
3. Double check if successfully installed
  ```
  uname -a
  ```

  e.g. Linux beaglebone 3.8.13-bone50

  ```
  cat /etc/debian_version
  ```

  e.g. 7.8

### Development Environment
```
apt-get update
apt-get upgrade
apt-get install build-essential
apt-get install python
apt-get install libbluetooth-dev
npm install -g bower
```

### sensorjs-app git repository cloning 
```
cd [target directory]
git clone https://github.com/daliworks/sensorjs-app
[github username]
[github password] 
```

### One-wire Setting
```
cd [files-directory]
cp BB-W1-00A0.dtbo /lib/firmware/
cp capemgr /etc/default/
sync
reboot
```

### Device App
```
cd [src-directory]
cd device-app
npm install
```

### Device Client
```
cd [src-directory]
cd device-client
bower install --allow-root
npm install
```

## Getting Started
```
cd device-app
node app.js
```

__Open browser and access__
(BBB_IP:Port)

e.g. 192.168.1.100:8088


## License

(The MIT License)

Copyright (c) 2013 [Daliworks Inc](http://www.daliworks.co.kr)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated       documentation files (the 'Software'), to deal in the Software without restriction, including without limitation    the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and   to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of   the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO   THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF          CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS  IN THE SOFTWARE.

[Facebook](https://www.facebook.com/groups/sensor.js)
[Twitter](https://twitter.com/sensorjs)
