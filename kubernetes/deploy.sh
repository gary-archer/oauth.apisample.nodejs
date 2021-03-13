#!/bin/bash

#
# Before running this script, deploy certificates to the cluster:
# - git clone https://github.com/gary-archer/oauth.developmentcertificates
# - cd kubernetes
# - ./deploy.sh

#
# Use the Minikube Docker Daemon rather than that of Docker Desktop for Mac
#
minikube profile api
eval $(minikube docker-env)

#
# Build the API's code
#
cd ..
npm install
npm run buildRelease
if [ $? -ne 0 ]
then
  echo "*** API build error ***"
  exit 1
fi

#
# Build the API's docker image
#
docker build --no-cache -f kubernetes/Dockerfile -t demoapi:v1 .
if [ $? -ne 0 ]
then
  echo "*** API docker build error ***"
  exit 1
fi

#
# Deploy the API to the cluster and expose it over the API endpoint
#
kubectl delete deploy/demoapi       2>/dev/null
kubectl delete service/demoapi-svc  2>/dev/null
kubectl apply -f kubernetes/internal-cert.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
if [ $? -ne 0 ]
then
  echo "*** API deployment error ***"
  exit 1
fi
