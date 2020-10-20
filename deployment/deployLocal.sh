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
kubectl create -f Kubernetes.yaml
if [ $? -ne 0 ]
then
  echo "*** Kubernetes deployment error ***"
  exit 1
fi

#
# Output the names of created PODs and indicate success
#
echo "Deployment completed successfully"
kubectl get pod -l app=nodeapi
API_URL=$(minikube service --url nodeapi-svc)/api/companies
echo $API_URL

#
# Troubleshooting commands from outside Kubernetes
#
#curl $API_URL
#kubectl describe service nodeapi-svc
#kubectl logs --tail=100 pod/nodeapi-74f57df659-2tjz5

#
# Troubleshooting commands from inside the POD
#
#kubectl exec --stdin --tty pod/nodeapi-74f57df659-2tjz5 -- /bin/sh
#ls -lr /usr/sampleapi
#apk add curl
#curl http://localhost/api/companies