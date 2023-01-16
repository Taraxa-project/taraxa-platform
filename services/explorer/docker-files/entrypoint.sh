#!/bin/sh

export MAINNET_FAUCET_HOST=${MAINNET_FAUCET_HOST:="https://faucet-mainnet.qa.explorer.taraxa.io"}
export TESTNET_FAUCET_HOST=${TESTNET_FAUCET_HOST:="https://faucet-testnet.qa.explorer.taraxa.io"}
export DEVNET_FAUCET_HOST=${DEVNET_FAUCET_HOST:="https://faucet-devnet.qa.explorer.taraxa.io"}
export MAINNET_API_HOST=${MAINNET_API_HOST:="https://api-mainnet.qa.explorer.taraxa.io"}
export TESTNET_API_HOST=${TESTNET_API_HOST:="https://api-testnet.qa.explorer.taraxa.io"}
export DEVNET_API_HOST=${DEVNET_API_HOST:="https://api-devnet.qa.explorer.taraxa.io"}

export STATIC_FOLDER="/usr/share/nginx/html"

# Removing trailing slash if exists
MAINNET_FAUCET_HOST=${MAINNET_FAUCET_HOST%/}
TESTNET_FAUCET_HOST=${TESTNET_FAUCET_HOST%/}
DEVNET_FAUCET_HOST=${DEVNET_FAUCET_HOST%/}
MAINNET_API_HOST=${MAINNET_API_HOST%/}
TESTNET_API_HOST=${TESTNET_API_HOST%/}
DEVNET_API_HOST=${DEVNET_API_HOST%/}

echo "Replace from env vars..."

find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_MAINNET_FAUCET_HOST_STRING_REPLACE,$MAINNET_FAUCET_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TESTNET_FAUCET_HOST_STRING_REPLACE,$TESTNET_FAUCET_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_DEVNET_FAUCET_HOST_STRING_REPLACE,$DEVNET_FAUCET_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_MAINNET_API_HOST_STRING_REPLACE,$MAINNET_API_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TESTNET_API_HOST_STRING_REPLACE,$TESTNET_API_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_DEVNET_API_HOST_STRING_REPLACE,$DEVNET_API_HOST,g" {} \;

exec "$@"
