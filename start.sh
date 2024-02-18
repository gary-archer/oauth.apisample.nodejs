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
# Call a shared script to do the work
#
./run_api.sh
