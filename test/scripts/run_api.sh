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
# Run the API in this terminal
#
npm start