#!/bin/sh

export API_HOST=${API_HOST:="https://api-devnet.qa.explorer.taraxa.io"}
export GRAPHQL_HOST=${GRAPHQL_HOST:="https://graphql.devnet.taraxa.io"}
export FAUCET_ROOT_URL=${API_HOST:="https://faucet-devnet.qa.explorer.taraxa.io"}

export STATIC_FOLDER="/usr/share/nginx/html"

# Removing trailing slash if exists
API_HOST=${API_HOST%/}
GRAPHQL_HOST=${GRAPHQL_HOST%/}
FAUCET_ROOT_URL=${FAUCET_ROOT_URL%/}

echo "Replace from env vars..."

find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_API_HOST_STRING_REPLACE,$API_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_GRAPHQL_HOST_STRING_REPLACE,$GRAPHQL_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_FAUCET_ROOT_URL_STRING_REPLACE,$FAUCET_ROOT_URL,g" {} \;

exec "$@"
