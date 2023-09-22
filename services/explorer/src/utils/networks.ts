import {
  NetworkName,
  NetworkGraphQLEndpoints,
} from '@taraxa_project/taraxa-sdk';
import {
  MAINNET_API,
  TESTNET_API,
  DEVNET_API,
  TESTNET_FAUCET_API,
  DEVNET_FAUCET_API,
  DEVNET_RPC_API,
  TESTNET_RPC_API,
  MAINNET_RPC_API,
} from '../api';

export const recreateGraphQLConnection = (network: string): string => {
  let connectionString: string;
  switch (network) {
    case NetworkName.MAINNET: {
      connectionString = NetworkGraphQLEndpoints.MAINNET;
      break;
    }
    case NetworkName.TESTNET: {
      connectionString = NetworkGraphQLEndpoints.TESTNET;
      break;
    }
    case NetworkName.DEVNET: {
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
    case NetworkName.MAINNET: {
      connectionString = MAINNET_API;
      break;
    }
    case NetworkName.TESTNET: {
      connectionString = TESTNET_API;
      break;
    }
    case NetworkName.DEVNET: {
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

export const recreateRPCConnection = (network: string): string => {
  let connectionString: string;
  switch (network) {
    case NetworkName.MAINNET: {
      connectionString = MAINNET_RPC_API;
      break;
    }
    case NetworkName.TESTNET: {
      connectionString = TESTNET_RPC_API;
      break;
    }
    case NetworkName.DEVNET: {
      connectionString = DEVNET_RPC_API;
      break;
    }
    default: {
      connectionString = TESTNET_RPC_API;
      break;
    }
  }
  return connectionString;
};

export const recreateFaucetConnection = (network: string): string => {
  let connectionString: string;
  switch (network) {
    case NetworkName.TESTNET: {
      connectionString = TESTNET_FAUCET_API;
      break;
    }
    case NetworkName.DEVNET: {
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

export const getNetworkSubdomain = (network: string): string => {
  switch (network) {
    case NetworkName.TESTNET:
      return 'testnet';
    case NetworkName.DEVNET:
      return 'devnet';
    case NetworkName.MAINNET:
      return 'mainnet';
    default:
      return;
  }
};

export const networkRedirect = (network: string): void => {
  const currentUrl = window.location.href;
  const isLocalhost = currentUrl.includes('localhost');
  const isQa = currentUrl.includes('qa.explorer.taraxa.io');
  const networkSubdomain = getNetworkSubdomain(network);

  let redirectUrl;
  if (isLocalhost) {
    redirectUrl = currentUrl;
  } else if (isQa) {
    const baseDomain = currentUrl.match(
      /^(https?:\/\/)?([^/?#]+)(?:[/?#]|$)/i
    )[2];
    redirectUrl = currentUrl.replace(
      baseDomain,
      `${networkSubdomain}.qa.explorer.taraxa.io`
    );
  } else {
    const baseDomain = currentUrl.match(
      /^(https?:\/\/)?([^/?#]+)(?:[/?#]|$)/i
    )[2];
    redirectUrl = currentUrl.replace(
      baseDomain,
      `${networkSubdomain}.explorer.taraxa.io`
    );
  }

  if (redirectUrl !== currentUrl) {
    window.location.replace(redirectUrl);
  }
};
