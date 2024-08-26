#!/bin/bash

##########################################################################
# A script to build and run the API locally
# On Windows, ensure that you have first set Git bash as the node.js shell
# - npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
##########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Ensure that the development configuration is used
#
cp deployment/environments/dev/api.config.json ./api.config.json

#
# Download development SSL certificates if required
#
./downloadcerts.sh
if [ $? -ne 0 ]; then
  read -n 1
  exit 1
fi

#
# Default to our trusted CA file, or the user can add this CA to their own trust file
#
if [ "$NODE_EXTRA_CA_CERTS" == '' ]; then
  export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.crt'
fi

#
# Call a shared script to do the work
#
./run_api.sh
