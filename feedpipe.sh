#!/bin/bash
while true; do
    if [ -s ./command ]
    then
        cat ./command | tee > /tmp/reverseinput
        rm -f ./command
        # echo oui
    else
        sleep 0.1
    fi
done