#!/bin/bash

#############################################
# A script to run the API in a child terminal
#############################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Install dependencies if needed
#
if [ ! -d 'node_modules' ]; then
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building the API'
    exit
  fi
fi

#
# Set trusted root certificates used for testing
#
export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.pem'

#
# Run the API in this terminal
# On Linux ensure that you have first granted Node.js permissions to listen on port 446:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm start

#
# Prevent automatic terminal closure
#
read -n 1