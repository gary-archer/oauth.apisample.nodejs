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
# Then start listening
#
npm start
if [ $? -ne 0 ]; then
    echo 'Problem encountered running the API'
    exit
fi
