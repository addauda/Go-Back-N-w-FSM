#!/bin/bash

if [ $# -gt 0 ]; then
    echo "Receiver started with $# arguments"
    node receiver.js $1 $2 $3 $4
else
    echo "Receiver started with no params - using defaults"
    EMU_IP=10.0.2.15
    EMU_ACK_PORT=9993
    RCVR_PORT=9994
    OUTPUT_FILE=output.txt
    node receiver.js $EMU_IP $EMU_ACK_PORT $RCVR_PORT $OUTPUT_FILE
fi