#!/bin/bash

if [ $# -gt 0 ]; then
    echo "Sender started with $# arguments"
    node sender.js $1 $2 $3 $4
else
    echo "Sender started with no params - using defaults"
    EMU_IP=10.0.2.15
    EMU_DATA_PORT=9991
    SNDR_PORT=9992
    INPUT_FILE=input.txt
    node sender.js $EMU_IP $EMU_DATA_PORT $SNDR_PORT $INPUT_FILE
fi