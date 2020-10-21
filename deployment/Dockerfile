#
# Build the docker image when invoked from the deployment script
#

# Use the Node docker image for the lightweight Alpine Linux OS
FROM node:14.4.0-alpine

# Set the API folder
WORKDIR /usr/sampleapi

# Copy files into our docker image
COPY src/                       /usr/sampleapi/src/
COPY data/*                     /usr/sampleapi/data/
COPY deployment/api.config.json /usr/sampleapi/
COPY package*.json              /usr/sampleapi/
COPY tsconfig.json              /usr/sampleapi/

# Install production dependencies
RUN npm install --production

# When the container is run, this will execute the NodeJS program
CMD ["npm", "start"]
