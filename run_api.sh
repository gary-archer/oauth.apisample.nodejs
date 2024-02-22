#!/bin/bash

##########################################
# A shared script to build and run the API
##########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download development SSL certificates if required
#
./downloadcerts.sh
if [ $? -ne 0 ]; then
  read -n 1
  exit 1
fi

#
# Install dependencies if needed
#
if [ ! -d 'node_modules' ]; then
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building the API'
    read -n 1
    exit 1
  fi
fi

#
# Enforce code quality checks
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Code quality checks failed'
  read -n 1
  exit 1
fi

#
# Set trusted root certificates used for testing
#
export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.pem'

#
# Ensure that the log folder exists
#
if [ ! -d '../logs' ]; then
  mkdir './logs'
fi

#
# Run the API
# On Linux ensure that you have first granted Node.js permissions to listen on port 446:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npx tsx src/host/startup/app.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered starting the API'
  read -n 1
  exit 1
fi

#
# Prevent automatic terminal closure
#
read -n 1
