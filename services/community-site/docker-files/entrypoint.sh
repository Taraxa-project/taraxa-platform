#!/bin/sh

export API_HOST=${API_HOST:="https://api.qa.community.taraxa.io"}
export TARA_ADDRESS=${TARA_ADDRESS:="0xF1ad3aEe148baD0BB1e7c0b7069a130862CC4C0d"}
export CLAIM_ADDRESS=${CLAIM_ADDRESS:="0xF1ad3aEe148baD0BB1e7c0b7069a130862CC4C0d"}
export STAKING_ADDRESS=${STAKING_ADDRESS:="0x46Fedb556d84e139846C7401C93fF14D160D4947"}

export STATIC_FOLDER="/usr/share/nginx/html"

# Removing trailing slash if exists
API_HOST=${API_HOST%/}

echo "Replace from env vars..."

find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_API_HOST_STRING_REPLACE,$API_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TARA_ADDRESS_STRING_REPLACE,$TARA_ADDRESS,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_CLAIM_ADDRESS_STRING_REPLACE,$CLAIM_ADDRESS,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_STAKING_ADDRESS_STRING_REPLACE,$STAKING_ADDRESS,g" {} \;

exec "$@"
