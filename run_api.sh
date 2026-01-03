#!/bin/bash

##########################################
# A shared script to build and run the API
##########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install dependencies if needed
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing dependencies'
  read -n 1
  exit 1
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
# Ensure that the log folder exists
#
if [ ! -d './logs' ]; then
  mkdir './logs'
fi

#
# Run the API
# On Linux ensure that you have first granted Node.js permissions to listen on port 446:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npx tsx --inspect-brk src/host/startup/app.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered starting the API'
  read -n 1
  exit 1
fi

#
# Prevent automatic terminal closure
#
read -n 1
