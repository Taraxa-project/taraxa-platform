import { ENVIRONMENT, Network, NetworkGraphQLEndpoints } from './Enums';
import {
  MAINNET_API,
  TESTNET_API,
  DEVNET_API,
  TESTNET_FAUCET_API,
  DEVNET_FAUCET_API,
} from '../api';
import { getEnvironment } from './getEnvironment';

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
  const currentEnv = getEnvironment();

  switch (currentEnv) {
    case ENVIRONMENT.LOCALHOST:
      return;
    case ENVIRONMENT.QA:
      switch (network) {
        case Network.MAINNET: {
          window.location.replace(`https://mainnet.qa.explorer.taraxa.io`);
          return;
        }
        case Network.TESTNET: {
          window.location.replace(`https://testnet.qa.explorer.taraxa.io`);
          return;
        }
        case Network.DEVNET: {
          window.location.replace(`https://devnet.qa.explorer.taraxa.io`);
          return;
        }
        default: {
          window.location.replace(`https://mainnet.qa.explorer.taraxa.io`);
          return;
        }
      }
    case ENVIRONMENT.PROD:
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
    default:
      return;
  }
};
