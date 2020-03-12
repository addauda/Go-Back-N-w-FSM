#!/bin/bash

if [ $# -gt 0 ]; then
    echo "Emulator started with $# arguments"
    ./nEmulator-linux386 $1 $2 $3 $4 $5 $6 $7 $8 $9
else
    echo "Emulator started with no params - using defaults"
    EMU_DATA_PORT=9991
    RCVR_IP=10.0.2.15
    RCVR_PORT=9994
    EMU_ACK_PORT=9993
    SNDR_IP=10.0.2.15
    SNDR_PORT=9992
    DELAY=1
    DISCARD_PROBABILITY=0.2
    VERBOSE_MODE=1
    ./nEmulator-linux386 $EMU_DATA_PORT $RCVR_IP $RCVR_PORT $EMU_ACK_PORT $SNDR_IP $SNDR_PORT $DELAY $DISCARD_PROBABILITY $VERBOSE_MODE
fi
