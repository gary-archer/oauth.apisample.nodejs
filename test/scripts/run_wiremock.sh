#!/bin/bash

##############################################
# A script to run Wiremock in a child terminal
##############################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Run Wiremock over HTTPS in this terminal
# On Linux ensure that you have first granted Java permissions to listen on port 445:
# - sudo setcap 'cap_net_bind_service=+ep' /usr/lib/jvm/zulu-17-amd64/bin/java
#
./node_modules/.bin/wiremock --root-dir test/integration --https-port 446 --disable-http \
--https-keystore './certs/authsamples-dev.ssl.p12' --keystore-type 'pkcs12' --keystore-password 'Password1' --key-manager-password 'Password1'

#
# Prevent automatic terminal closure on Linux
#
if [ "$(uname -s)" == 'Linux' ]; then
  read -n 1
fi
