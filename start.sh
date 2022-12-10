#!/bin/bash

###########################################################################
# A script to download SSL certificates, then build and run the API locally
###########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download development SSL certificates if required
#
./downloadcerts.sh
if [ $? -ne 0 ]; then
  exit
fi

#
# Ensure that the development configuration is used
#
cp deployment/environments/dev/api.config.json ./api.config.json

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
# Enforce code quality checks
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Code quality checks failed'
  exit
fi

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
# Run the API in watch mode
# On Linux first ensure that you have first granted Node.js permissions to listen on port 446:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
RUN_COMMAND="./node_modules/.bin/ts-node --files src/host/startup/app.ts"
./node_modules/.bin/nodemon --watch 'src/**/*' -e ts --exec "$RUN_COMMAND"
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the API'
  exit
fi
