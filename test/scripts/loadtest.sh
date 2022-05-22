#!/bin/bash

###########################################################
# A script to run the load test after configuring SSL trust
###########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Tests will call the API over SSL, so trust the development root certificate
#
export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.pem'

#
# Run the load test
#
./node_modules/.bin/ts-node test/loadTest.ts
