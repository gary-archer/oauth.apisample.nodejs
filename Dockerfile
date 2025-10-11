FROM node:24-bookworm-slim

WORKDIR /usr/api
COPY --chown=10001:10000 dist                /usr/api/dist
COPY --chown=10001:10000 data/*              /usr/api/data/
COPY --chown=10001:10000 package*.json       /usr/api/
RUN npm install --omit=dev

RUN groupadd --gid 10000 apiuser \
  && useradd --uid 10001 --gid apiuser --shell /bin/bash --create-home apiuser
USER 10001

CMD ["node", "dist/host/startup/app.js"]
