FROM node:16.15
LABEL authors="ELIMELETH"
ENV TINI_VERSION="v0.19.0"
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini

RUN chmod +x /tini
RUN apt-get update && apt-get install -yq nano libgbm-dev gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget
COPY package.json /tmp/package.json
RUN cd /tmp && yarn install --production && yarn cache clean && mkdir -p /home/node/app && cp -a /tmp/node_modules /home/node/app

WORKDIR /home/node/app
COPY dist .
COPY .wwebjs_auth ./.wwebjs_auth
COPY .env .
COPY logs ./logs
COPY media ./media


ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH:-dev}


ENTRYPOINT ["/tini", "--", "node"]