#!/bin/bash

#
# A script to build our API into a docker image
#

#
# Point to the minikube api profile
#
minikube profile api
eval $(minikube docker-env --profile api)

#
# Build the NodeJS code to Javascript
#
echo "Building NodeJS Code ..."
npm run buildRelease
if [ $? -ne 0 ]
then
  echo "*** NodeJS build error ***"
  exit 1
fi

#
# Build the docker image, to package NodeJS files and other resources
#
echo "Building NodeJS Docker Image ..."
cd ..
docker build --no-cache -f deployment/Dockerfile -t nodeapi:v1 .
if [ $? -ne 0 ]
then
  echo "*** Docker build error ***"
  exit 1
fi

#
# Indicate success
#
cd deployment
echo "Build completed successfully"
