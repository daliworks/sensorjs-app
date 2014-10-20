#! /bin/sh
### BEGIN INIT INFO
# Provides:          device.sh
# Required-Start:    $rc.local $all
# Required-Stop:
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: device.sh
# Description:       daliworks device.sh
### END INIT INFO

##3.5...10...15...20...25...30...35...40...45...50...55...60...65...70...75...80
## 
##  Debian / Linux / Ubuntu / LSB
##  Startup script for Express / Node.js application with the forever module
##
##
##  A modification of "init.d.lsb.ex" by Nicolas Thouvenin 
##
##
## This is free software; you may redistribute it and/or modify
## it under the terms of the GNU General Public License as
## published by the Free Software Foundation; either version 2,
## or (at your option) any later version.
##
## This is distributed in the hope that it will be useful, but
## WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU General Public License for more details.
##
## You should have received a copy of the GNU General Public License with
## the Debian operating system, in /usr/share/common-licenses/GPL;  if
## not, write to the Free Software Foundation, Inc., 59 Temple Place,
## Suite 330, Boston, MA 02111-1307 USA
##
##

##
## Copyright (C) Daliworks, Inc. All rights reserved.
## Use is subject to license terms.
##

################################################################################
################################################################################
##                                                                            ##
#                           APPLICATION section                                #
##                                                                            ##
################################################################################
################################################################################

# !!!
# !!! If you do not want to change the variables below.
# !!! You must, first, rename the script with the name of the directory created 
# !!! by "express" and add the suffix ".sh"
# !!! Second, you must place this script right next to the directory created 
# !!! by "express"
# !!! 
# !!! For example:
# !!! /tmp/foo      # Created by the command "express /tmp/foo"
# !!! /tmp/foo.sh   # This script 
# !!! 


ME=`/usr/bin/basename $0`
DESC=`/usr/bin/basename $0 .sh`
DIR=`/usr/bin/dirname $(/bin/readlink -f $0)`
NAME="app.js"
[ -f "${DIR}/${DESC}/${NAME}" ] || NAME="app.min.js"
APP=${DIR}/${DESC}/${NAME}

export NODE_ENV=${NODE_ENV:="production"}

UPDATE_DIR="${DIR}/${DESC}/update"
. ${DIR}/${DESC}/update/models.sh #check model

# get hostname
[ -f /etc/hostname ] &&  _HOSTNAME=`head -n 1 /etc/hostname|awk '{ print $1; }'`
[ -z "${_HOSTNAME}" ] && _HOSTNAME=`hostname`
[ -z "${_HOSTNAME}" ] && _HOSTNAME=${HOSTNAME}
[ -z "${_HOSTNAME}" ] && _HOSTNAME=localhost

# prepare log
LOG_DIR=/var/log/sensorjs
LOG_FILE_PATH="${LOG_DIR}/${DESC}_${_HOSTNAME}.log"
[ ! -d "${LOG_DIR}" ] && mkdir -p ${LOG_DIR}
[ ! -f "${LOG_FILE_PATH}" ] && touch ${LOG_FILE_PATH}


APP_START_OPT="-a --uid ${DESC}"
FOREVER_SLEEP="--spinSleepTime 10000 --minUptime 10000"
FOREVER_LOG_FILE="-l ${LOG_FILE_PATH}"
FOREVER_KILL_SIGNAL="--killSignal=SIGTERM"
FOREVER_OPT="${FOREVER_SLEEP} ${FOREVER_LOG_FILE} ${FOREVER_KILL_SIGNAL}" #note: cannot set root for forever daemon

## home path is not set at bootup
export HOME=/root

## set node config directory
export NODE_CONFIG_DIR=${DIR}/${DESC}/config

################################################################################
################################################################################
##                                                                            ##
#                       PATHs section                                          #
##                                                                            ##
################################################################################
################################################################################


#export PATH=$HOME/local/bin:${PATH:=}
#export MANPATH=$HOME/local/man:${MANPATH:=}
#export LD_LIBRARY_PATH=$HOME/local/lib:${LD_LIBRARY_PATH:=}

### in case node and forever are in /usr/local/
export PATH=/usr/local/bin:${PATH:=}
export MANPATH=/usr/local/man:${MANPATH:=}
export LD_LIBRARY_PATH=/usr/local/lib:${LD_LIBRARY_PATH:=}



#######################
# common funcs
#######################
log() {
	echo "[${ME}]" "$@" >> ${LOG_FILE_PATH}
}

# do not execute from the sd-card image for flashing
if [ -f /root/beaglebone-black-copy-microSD-to-eMMC.sh ] ; then #from sd card
  log "Do not execute from sd-card"
  echo "Do not execute from sd-card"
  exit 1;
fi

#######################
# apply patch
#######################
if [ -f "$MODEL_PATCHES_FILE" ]; then
  (cd ${DIR}/${DESC}; /bin/bash ${MODEL_PATCHES_FILE} >> ${LOG_FILE_PATH} 2>&1)
else
  echo "no patch file found for model:[$MODEL]"
fi

################################################################################
################################################################################
##                                                                            ##
#                       FOREVER section                                        #
##                                                                            ##
################################################################################
################################################################################

running() {
	forever list ${FOREVER_OPT} 2>/dev/null | grep ${APP} 2>&1 >/dev/null
    return $?
}

start_server() {
  log "start @$(date)"
  if [ ! -d /sys/devices/w1_bus_master1 ]; then
		log "enable 1w"
	if [ `uname -r | grep "bone"` ]; then
		echo BB-W1:00A0 > /sys/devices/bone_capemgr.9/slots
        echo cape-bone-iio > /sys/devices/bone_capemgr.9/slots
	fi
  fi
  if [ ! -e /dev/ttyO4 ]; then
    log "enable ttyO4"
    SLOT=`echo /sys/devices/bone_capemgr*/slots`
    if [ -e /lib/firmware/ttyO4_armhf.com-00A0.dtbo ]; then
      echo ttyO4_armhf.com > ${SLOT}
    else
      log "fail to locate /lib/firmware/ttyO4_armhf.com-00A0.dtbo"
    fi
  fi
  if [ ! -e /dev/ttyO1 ]; then
    log "enable ttyO1"
    SLOT=`echo /sys/devices/bone_capemgr*/slots`
    if [ -e /lib/firmware/ttyO1_armhf.com-00A0.dtbo ]; then
      echo ttyO1_armhf.com > ${SLOT}
    else
      log "fail to locate /lib/firmware/ttyO1_armhf.com-00A0.dtbo"
    fi
  fi
  HCI_CONFIG=`which hciconfig`
  if [ "$HCI_CONFIG" != "" ]; then
    log "enable ble hci0"
    if [ `$HCI_CONFIG hci0 | grep "DOWN"` ]; then
      $HCI_CONFIG hci0 up
    fi
	fi

	forever start ${FOREVER_OPT} ${APP_START_OPT} ${APP} 2>&1 >/dev/null
	return $?
}

stop_server() {
	forever stop ${FOREVER_OPT} ${APP} 2>&1 >/dev/null
	return $?
}

################################################################################
################################################################################
##                                                                            ##
#                       GENERIC section                                        #
##                                                                            ##
################################################################################
################################################################################

. /lib/lsb/init-functions


DIETIME=10              # Time to wait for the server to die, in seconds
                        # If this value is set too low you might not
                        # let some servers to die gracefully and
                        # 'restart' will not work

STARTTIME=2             # Time to wait for the server to start, in seconds
                        # If this value is set each time the server is
                        # started (on start or restart) the script will
                        # stall to try to determine if it is running
                        # If it is not set and the server takes time
                        # to setup a pid file the log message might
                        # be a false positive (says it did not start
                        # when it actually did)

case "$1" in
	start)
		log_daemon_msg "Starting $DESC " "$NAME"
		# Check if it's running first
		if running ;  then
			log_progress_msg "apparently already running"
			log_end_msg 0
			exit 0
		fi
		if start_server ; then
			# NOTE: Some servers might die some time after they start,
			# this code will detect this issue if STARTTIME is set
			# to a reasonable value
			[ -n "$STARTTIME" ] && sleep $STARTTIME # Wait some time
			if  running ;  then
				# It's ok, the server started and is running
				log_end_msg 0
			else
				# It is not running after we did start
				log_end_msg 1
			fi
		else
			# Either we could not start it
			log_end_msg 1
		fi
		;;
	stop)
		log_daemon_msg "Stopping $DESC" "$NAME"
		if running ; then
			# Only stop the server if we see it running
			errcode=0
			stop_server || errcode=$?
			log_end_msg $errcode
		else
			# If it's not running don't do anything
			log_progress_msg "apparently not running"
			log_end_msg 0
			exit 0
		fi
		;;
	restart)
		log_daemon_msg "Restarting $DESC" "$NAME"
		errcode=0
		stop_server || errcode=$?
		# Wait some sensible amount, some server need this
		[ -n "$DIETIME" ] && sleep $DIETIME
		start_server || errcode=$?
		[ -n "$STARTTIME" ] && sleep $STARTTIME
		running || errcode=$?
		log_end_msg $errcode
		;;
	status)
		log_daemon_msg "Checking status of $DESC" "$NAME"
		if running ;  then
			log_progress_msg "running"
			log_end_msg 0
		else
			log_progress_msg "apparently not running"
			log_end_msg 1
			exit 1
		fi
		;;
	*)
		echo "Usage: ${0} {start|stop|status|restart}"
		exit 1
		;;
esac

exit 0
