#!/bin/bash

set -e

CURRENT_VERSION="0"

test -d /var/db || (mkdir -p /var/db && echo $CURRENT_VERSION > /var/VERSION)

# [[ "$(cat /var/VERSION)" == "${CURRENT_VERSION}" ]] || (cd /opt/app && echo "Upgrading Database...." && ./bin/update.sh && echo $CURRENT_VERSION > /var/VERSION)

./niscud --fork --logpath /var/mongod.log --dbpath /var/db --noauth --bind_ip 127.0.0.1 --nohttpinterface --noprealloc
sleep 2
LCB_HTTP_HOST=0.0.0.0 npm start
