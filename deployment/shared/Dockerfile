FROM node:18.1.0-bullseye

# Configure trusted root certificate authorities
ARG TRUSTED_CA_CERTS
COPY $TRUSTED_CA_CERTS /usr/local/share/certificates/trusted.ca.crt
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS='/usr/local/share/certificates/trusted.ca.crt'

# Copy files into our docker image and install dependencies
WORKDIR /usr/api
COPY dist                /usr/api/dist
COPY data/*              /usr/api/data/
COPY package*.json       /usr/api/
RUN npm install --production

# Create a low privilege user
RUN adduser --disabled-password --home /home/apiuser --gecos '' apiuser
USER apiuser

# Work around openssl and node.js compatibility in some setups
# https://github.com/nodejs/node/issues/40672
CMD ["node", "--openssl-legacy-provider", "dist/host/startup/app.js"]
