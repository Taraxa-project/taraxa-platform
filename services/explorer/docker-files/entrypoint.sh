#!/bin/sh

export TESTNET_FAUCET_HOST=${TESTNET_FAUCET_HOST:="https://faucet-testnet.qa.explorer.taraxa.io"}
export DEVNET_FAUCET_HOST=${DEVNET_FAUCET_HOST:="https://faucet-devnet.qa.explorer.taraxa.io"}
export MAINNET_API_HOST=${MAINNET_API_HOST:="https://api-mainnet.qa.explorer.taraxa.io"}
export TESTNET_API_HOST=${TESTNET_API_HOST:="https://api-testnet.qa.explorer.taraxa.io"}
export DEVNET_API_HOST=${DEVNET_API_HOST:="https://api-devnet.qa.explorer.taraxa.io"}
export DISPLAY_TXES_FOR_LAST_BLOCK=${DISPLAY_TXES_FOR_LAST_BLOCK:=25}
export TARAXA_MAINNET_PROVIDER=${TARAXA_MAINNET_PROVIDER:="https://rpc.mainnet.taraxa.io/"}
export TARAXA_TESTNET_PROVIDER=${TARAXA_TESTNET_PROVIDER:="https://rpc.testnet.taraxa.io/"}
export TARAXA_DEVNET_PROVIDER=${TARAXA_DEVNET_PROVIDER:="https://rpc.devnet.taraxa.io/"}

export STATIC_FOLDER="/usr/share/nginx/html"

# Removing trailing slash if exists
MAINNET_FAUCET_HOST=${MAINNET_FAUCET_HOST%/}
TESTNET_FAUCET_HOST=${TESTNET_FAUCET_HOST%/}
DEVNET_FAUCET_HOST=${DEVNET_FAUCET_HOST%/}
MAINNET_API_HOST=${MAINNET_API_HOST%/}
TESTNET_API_HOST=${TESTNET_API_HOST%/}
DEVNET_API_HOST=${DEVNET_API_HOST%/}

echo "Replace from env vars..."

find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TESTNET_FAUCET_HOST_STRING_REPLACE,$TESTNET_FAUCET_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_DEVNET_FAUCET_HOST_STRING_REPLACE,$DEVNET_FAUCET_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_MAINNET_API_HOST_STRING_REPLACE,$MAINNET_API_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TESTNET_API_HOST_STRING_REPLACE,$TESTNET_API_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_DEVNET_API_HOST_STRING_REPLACE,$DEVNET_API_HOST,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_DISPLAY_TXES_FOR_LAST_BLOCK_STRING_REPLACE,$DISPLAY_TXES_FOR_LAST_BLOCK,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TARAXA_MAINNET_PROVIDER_STRING_REPLACE,$TARAXA_MAINNET_PROVIDER,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TARAXA_TESTNET_PROVIDER_STRING_REPLACE,$TARAXA_TESTNET_PROVIDER,g" {} \;
find $STATIC_FOLDER -type f -exec sed -i "s,REACT_APP_TARAXA_DEVNET_PROVIDER_STRING_REPLACE,$TARAXA_DEVNET_PROVIDER,g" {} \;

exec "$@"
