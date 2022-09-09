#!/bin/bash

##########################################
# Build the API's code into a Docker image
##########################################

#
# Ensure that we are in the root folder
#
cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Check preconditions
#
if [ "$DOCKERHUB_ACCOUNT" == '' ]; then
  echo '*** The DOCKERHUB_ACCOUNT environment variable has not been configured'
  exit 1
fi

#
# Get the platform
#
case "$(uname -s)" in

  Darwin)
    PLATFORM="MACOS"
 	;;

  MINGW64*)
    PLATFORM="WINDOWS"
	;;

  Linux)
    PLATFORM="LINUX"
	;;
esac

#
# Build the Node.js API
#
npm install
npm run buildRelease
if [ $? -ne 0 ]; then
  echo '*** Node.js API build problem encountered'
  exit 1
fi

#
# Copy in the internal cluster root CA from the parent project, to be trusted within the container
#
copy ../../../certs/mycluster.ca.pem deployment/kubernetes-local/trusted.ca.pem

#
# On Windows, fix problems with trailing newline characters in Docker scripts
#
if [ "$PLATFORM" == 'WINDOWS' ]; then
  sed -i 's/\r$//' deployment/docker/docker-init.sh
fi

#
# Build the Docker container
#
docker build --no-cache -f deployment/docker/Dockerfile --build-arg TRUSTED_CA_CERTS='deployment/kubernetes-local/trusted.ca.pem' -t "$DOCKERHUB_ACCOUNT/finalnodejsapi:v1" .
if [ $? -ne 0 ]; then
  echo '*** API docker build problem encountered'
  exit 1
fi

#
# Push it to DockerHub
#
docker image push "$DOCKERHUB_ACCOUNT/finalnodejsapi:v1"
if [ $? -ne 0 ]; then
  echo '*** API docker deploy problem encountered'
  exit 1
fi
