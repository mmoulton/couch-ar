#!/bin/sh
export NODE_PATH=`pwd`/../node_modules:`pwd`/../
../node_modules/jasmine-node/bin/jasmine-node spec

