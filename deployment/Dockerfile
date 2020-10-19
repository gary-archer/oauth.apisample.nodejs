#
# Build the docker image when invoked from the deployment script
#

# Use the Node docker image for the lightweight Alpine Linux OS
FROM node:14.4.0-alpine

# Set the API folder
WORKDIR /usr/sampleapi

# Copy files into our docker image
COPY src/                       /usr/sampleapi/src/
COPY tsconfig.json              /usr/sampleapi/
COPY deployment/api.config.json /usr/sampleapi/
COPY certs/mycompany.ssl.pfx    /usr/sampleapi/certs/
COPY package*.json              /usr/sampleapi/
COPY data/*                     /usr/sampleapi/data/

# Install production dependencies
RUN npm install --production

# When the container is run, this will execute the NodeJS program
CMD ["npm", "start"]

# This can be used to view the image's file structure before deploying it
# docker run -it nodeapi sh