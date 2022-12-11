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
    read -n 1
    exit
  fi
fi

#
# Set trusted root certificates used for testing
#
export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.pem'

#
# Ensure that log folders exist
#
if [ ! -d '../oauth.logs' ]; then
  mkdir '../oauth.logs'
fi
if [ ! -d '../oauth.logs/api' ]; then
  mkdir '../oauth.logs/api'
fi

#
# Run the API in this terminal
# On Linux ensure that you have first granted Node.js permissions to listen on port 446:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
RUN_COMMAND="./node_modules/.bin/ts-node --files src/host/startup/app.ts"
./node_modules/.bin/nodemon --watch 'src/**/*' -e ts --exec "$RUN_COMMAND"
if [ $? -ne 0 ]; then
  echo 'Problem encountered starting the API'
  read -n 1
  exit
fi

#
# Prevent automatic terminal closure
#
read -n 1
