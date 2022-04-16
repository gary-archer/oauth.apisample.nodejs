#!/bin/bash

##############################################
# A script to run Wiremock in a child terminal
##############################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Run Wiremock on port 80 in this terminal
#
./node_modules/.bin/wiremock --root-dir test/integration --port 80