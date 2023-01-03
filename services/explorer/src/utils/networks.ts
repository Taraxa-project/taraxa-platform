import { SELECTED_NETWORK, Network } from './Enums';
import {
  GRAPHQL_API_TESTNET,
  GRAPHQL_API_DEVNET,
  GRAPHQL_API_MAINNET,
  MAINNET_API,
  TESTNET_API,
  DEVNET_API,
} from '../api';

export const recreateGraphQLConnection = () => {
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

export const recreateAPIConnection = () => {
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

interface _Network {
  chainName: string;
  rpcUrl: string;
  iconUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

interface Networks {
  [key: number]: _Network;
}
export const networks: Networks = {
  841: {
    chainName: 'Taraxa Mainnet',
    rpcUrl: 'https://rpc.mainnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://explorer.mainnet.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
  },
  842: {
    chainName: 'Taraxa Testnet',
    rpcUrl: 'https://rpc.testnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://explorer.testnet.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
  },
  843: {
    chainName: 'Taraxa Devnet',
    rpcUrl: 'https://rpc.devnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://explorer.devnet.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
  },
};
