#
# The docker image for the OAuth secured sample API
# After building, files in the image can be viewed via the below commands
# - eval $(minikube docker-env --profile api)
# - docker run -it sampleapi:v1 sh
#

# Use the Node docker image for the lightweight Alpine Linux OS
FROM node:16.6.0-alpine

# Install tools for troubleshooting purposes
RUN apk --no-cache add curl
#RUN apk --no-cache add openssl

# Set the API folder
WORKDIR /usr/api

# Copy files into our docker image and install dependencies
COPY oauth.apisample/dist/                      /usr/api/dist/
COPY oauth.apisample/data/*                     /usr/api/data/
COPY oauth.apisample/package*.json              /usr/api/
RUN npm install --production

# Create a low privilege user and grant it access to the logs volume
RUN addgroup -g 1001 apigroup
RUN adduser -u 1001 -G apigroup -h /home/apiuser -D apiuser

# Configure the Linux OS to trust the root certificate, to enable HTTPS calls inside the cluster
COPY certs/docker-internal/mycompany.internal.ca.pem /usr/local/share/ca-certificates/trusted.ca.pem
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/trusted.ca.pem

# Run the Express app as the low privilege user
USER apiuser
CMD ["npm", "run", "startRelease"]
