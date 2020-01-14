#!/bin/bash
rm /tmp/reverseinput
mkfifo /tmp/reverseinput
chmod a+w /tmp/reverseinput
touch reverseresult
chmod 777 reverseresult
./feedpipe.sh &
tail -f /tmp/reverseinput | nc -lvp 4242 > reverseresult