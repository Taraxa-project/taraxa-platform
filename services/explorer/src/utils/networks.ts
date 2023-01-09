import { Network, NetworkGraphQLEndpoints, SELECTED_NETWORK } from './Enums';
import {
  MAINNET_API,
  TESTNET_API,
  DEVNET_API,
  MAINNET_FAUCET_API,
  TESTNET_FAUCET_API,
  DEVNET_FAUCET_API,
} from '../api';

export const recreateGraphQLConnection = (): string => {
  const network = localStorage.getItem(SELECTED_NETWORK) || '';
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

export const recreateAPIConnection = (): string => {
  const network = localStorage.getItem(SELECTED_NETWORK);
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

export const recreateFaucetConnection = (): string => {
  const network = localStorage.getItem(SELECTED_NETWORK);
  let connectionString: string;
  switch (network) {
    case Network.MAINNET: {
      connectionString = MAINNET_FAUCET_API;
      break;
    }
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
