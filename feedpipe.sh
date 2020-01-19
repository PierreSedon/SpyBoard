#!/bin/bash
while true; do
    if [ -s cmd/command ]
    then
        cat cmd/command | tee > /tmp/reverseinput
        rm -f cmd/command
    else
        sleep 0.1
    fi
done