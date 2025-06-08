FROM node:22-bookworm-slim

WORKDIR /usr/api
COPY dist                /usr/api/dist
COPY data/*              /usr/api/data/
COPY package*.json       /usr/api/
RUN npm install --omit=dev

RUN groupadd --gid 10000 apiuser \
  && useradd --uid 10001 --gid apiuser --shell /bin/bash --create-home apiuser
USER 10001
CMD ["node", "dist/host/startup/app.js"]
