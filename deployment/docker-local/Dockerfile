FROM node:18.15.0-bullseye

# Configure trusted root certificate authorities
COPY certs/authsamples-dev.ca.pem /usr/local/share/certificates/trusted.ca.crt
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS='/usr/local/share/certificates/trusted.ca.crt'

# Copy files into our docker image and install dependencies
WORKDIR /usr/api
COPY dist                /usr/api/dist
COPY data/*              /usr/api/data/
COPY package*.json       /usr/api/
RUN npm install --production

# Run the app as a low privilege user
RUN groupadd --gid 10000 apiuser \
  && useradd --uid 10001 --gid apiuser --shell /bin/bash --create-home apiuser
USER 10001
CMD ["node", "dist/host/startup/app.js"]
