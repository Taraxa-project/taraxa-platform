import { SELECTED_NETWORK, Network } from './Enums';
import {
  GRAPHQL_API_TESTNET,
  GRAPHQL_API_DEVNET,
  GRAPHQL_API_MAINNET,
  MAINNET_API,
  TESTNET_API,
  DEVNET_API,
} from '../api';

export const recreateGraphQLConnection = (): string => {
  const network = localStorage.getItem(SELECTED_NETWORK);
  let connectionString: string;
  switch (network) {
    case Network.MAINNET: {
      connectionString = GRAPHQL_API_MAINNET;
      break;
    }
    case Network.TESTNET: {
      connectionString = GRAPHQL_API_TESTNET;
      break;
    }
    case Network.DEVNET: {
      connectionString = GRAPHQL_API_DEVNET;
      break;
    }
    default: {
      connectionString = GRAPHQL_API_TESTNET;
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
