#!/bin/bash

##########################################
# A shared script to build and run the API
##########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install dependencies if needed
#
npm ci
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing dependencies'
  exit 1
fi

#
# Enforce code quality checks
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Code quality checks failed'
  exit 1
fi

#
# Ensure that the log folder exists
#
if [ ! -d './logs' ]; then
  mkdir './logs'
fi

#
# Tell Node.js to trust the development root CA
#
export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.crt'

#
# Run the API
#
npx tsx src/host/startup/app.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered starting the API'
  exit 1
fi
