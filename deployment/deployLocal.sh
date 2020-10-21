#!/bin/bash

#
# A MacOS script to build the Node API and deploy it to a local PC minikube Kubernetes cluster
#

#
# Use the Minikube Docker Daemon rather than that of Docker Desktop for Mac
#
echo "Preparing Kubernetes ..."
eval $(minikube docker-env)

#
# Clean up any resources for the previously deployed version of the API
#
kubectl delete deploy/nodeapi               2>/dev/null
kubectl delete svc/nodeapi-svc              2>/dev/null
docker image rm -f nodeapi                  2>/dev/null
kubectl delete secret mycompany-com-tls     2>/dev/null

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
# Deploy our SSL wildcard certificate to the Kubernetes cluster
#
kubectl create secret tls mycompany-com-tls --cert=../certs/mycompany.ssl.crt --key=../certs/mycompany.ssl.key

#
# Deploy 2 instances of the local docker image to 2 Kubernetes pods
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
# Expose the API to clients outside Kubernetes on port 443 with a custom host name
# We can then access the API at https://nodeapi.mycompany.com/api/companies
#
minikube addons enable ingress
kubectl apply -f ingress.yaml
echo "Deployment completed successfully"
