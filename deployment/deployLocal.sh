#!/bin/bash

#
# A MacOS script to build the Node API and deploy it to a local PC minikube Kubernetes cluster
#

#
# Use the minikube docker daemon rather than that of Docker Desktop for Mac
#
echo "Preparing Kubernetes ..."
eval $(minikube docker-env)

#
# Clean up any resources for the previously deployed version of the API
#
kubectl delete deploy/nodeapi   2>/dev/null
kubectl delete svc/nodeapi-svc  2>/dev/null
docker image rm -f nodeapi      2>/dev/null

#
# Build the docker image, with the Node files and other resources
#
echo "Building NodeJS Docker Image ..."
cd ..
docker build -f deployment/Dockerfile -t nodeapi .
if [ $? -ne 0 ]
then
  echo "*** Docker build error ***"
  exit 1
fi

#
# Deploy the local docker image to multiple Kubernetes pods
#
echo "Deploying Docker Image to Kubernetes ..."
cd deployment
kubectl apply -f Kubernetes.yaml
if [ $? -ne 0 ]
then
  echo "*** Kubernetes deployment error ***"
  exit 1
fi

#
# Expose the API over port 80 for a custom host name
# Once available we can run http://nodeapi.mycompany.com/api/companies
#
minikube addons enable ingress
kubectl apply -f ingress.yaml
echo "Deployment completed successfully"