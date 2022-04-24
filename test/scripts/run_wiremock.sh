#!/bin/bash

##############################################
# A script to run Wiremock in a child terminal
##############################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Run Wiremock over HTTPS in this terminal
#
./node_modules/.bin/wiremock --root-dir test/integration --https-port 446 --disable-http \
--https-keystore './certs/authsamples-dev.ssl.p12' --keystore-type 'pkcs12' --keystore-password 'Password1' --key-manager-password 'Password1'
