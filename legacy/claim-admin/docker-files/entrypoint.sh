#!/bin/sh
export STATIC_FOLDER="/usr/share/nginx/html"
export REACT_APP_BASE_URL=${REACT_APP_BASE_URL:="http://api.qa.claim.taraxa.io/"}

# Removing trailing slash if exists
REACT_APP_BASE_URL=${REACT_APP_BASE_URL%/}

echo "Replace from env vars..."
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_BASE_URL_STRING_REPLACE,$REACT_APP_BASE_URL,g" {} \;

exec "$@"
