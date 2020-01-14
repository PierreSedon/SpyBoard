#!/bin/bash
while true; do
    if [ -s assets/command ]
    then
        cat assets/command | tee > /tmp/reverseinput
        rm -f assets/command
        # echo oui
    else
        sleep 0.1
    fi
done