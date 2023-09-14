#!/bin/bash

# set -e

try
{
    echo "Building distributable"
    yarn build
    cp -r src/data dist/src/data
    cp -r src/messages dist/src/
    cp -r src/shared/configs dist/src/shared

    echo "Stopping and removing previous containers"
    docker-compose rm -f bot

    echo "Composing new containers"
    if [[ -z $(docker ps -q -f name=LOCALDBOT) ]]; then docker-compose up --force-recreate -d; else docker-compose up --build -d bot; fi

    #   echo "Copying files"
    #   docker cp -a patch/Injected.js BOT:/opt/app/node_modules/whatsapp-web.js/src/util/Injected.js
    #   docker cp -a media/ BOT:/opt/app/media

    #   echo "Restarting container"
    #   docker restart BOT

    echo "Logging output"
    docker logs -f --tail 100 BOT

    exit 0
}
catch || {
  echo "Error: $exception"
}
