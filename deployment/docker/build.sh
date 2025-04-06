#!/bin/bash

##############################################################
# A script to test Docker deployment on a development computer
##############################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Create SSL certificates if required
#
./certs/create.sh
if [ $? -ne 0 ]; then
  exit 1
fi

#
# Install dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing dependencies"
  exit
fi

#
# Build to the dist folder
#
npm run buildRelease
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the Node.js code'
  exit
fi

#
# Build the docker image
#
docker build -t finalnodejsapi:latest .
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the API docker image'
  exit
fi
