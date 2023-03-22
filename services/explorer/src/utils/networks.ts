import { Network, NetworkGraphQLEndpoints } from './Enums';
import {
  MAINNET_API,
  TESTNET_API,
  DEVNET_API,
  TESTNET_FAUCET_API,
  DEVNET_FAUCET_API,
  IS_DEV,
} from '../api';

export const recreateGraphQLConnection = (network: string): string => {
  let connectionString: string;
  switch (network) {
    case Network.MAINNET: {
      connectionString = NetworkGraphQLEndpoints.MAINNET;
      break;
    }
    case Network.TESTNET: {
      connectionString = NetworkGraphQLEndpoints.TESTNET;
      break;
    }
    case Network.DEVNET: {
      connectionString = NetworkGraphQLEndpoints.DEVNET;
      break;
    }
    default: {
      connectionString = NetworkGraphQLEndpoints.TESTNET;
      break;
    }
  }
  return connectionString;
};

export const recreateAPIConnection = (network: string): string => {
  let connectionString: string;
  switch (network) {
    case Network.MAINNET: {
      connectionString = MAINNET_API;
      break;
    }
    case Network.TESTNET: {
      connectionString = TESTNET_API;
      break;
    }
    case Network.DEVNET: {
      connectionString = DEVNET_API;
      break;
    }
    default: {
      connectionString = TESTNET_API;
      break;
    }
  }
  return connectionString;
};

export const recreateFaucetConnection = (network: string): string => {
  let connectionString: string;
  switch (network) {
    case Network.TESTNET: {
      connectionString = TESTNET_FAUCET_API;
      break;
    }
    case Network.DEVNET: {
      connectionString = DEVNET_FAUCET_API;
      break;
    }
    default: {
      connectionString = TESTNET_FAUCET_API;
      break;
    }
  }
  return connectionString;
};

export const onNetworkChange = (network: string): void => {
  if (IS_DEV === 'true') {
    return;
  }
  switch (network) {
    case Network.MAINNET: {
      window.location.replace(`https://mainnet.explorer.taraxa.io`);
      return;
    }
    case Network.TESTNET: {
      window.location.replace(`https://testnet.explorer.taraxa.io`);
      return;
    }
    case Network.DEVNET: {
      window.location.replace(`https://devnet.explorer.taraxa.io`);
      return;
    }
    default: {
      window.location.replace(`https://mainnet.explorer.taraxa.io`);
      return;
    }
  }
};
