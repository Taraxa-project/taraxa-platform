import { Network, NetworkGraphQLEndpoints } from './Enums';
import {
  MAINNET_API,
  TESTNET_API,
  DEVNET_API,
  TESTNET_FAUCET_API,
  DEVNET_FAUCET_API,
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

export const getNetworkSubdomain = (network: string): string => {
  switch (network) {
    case Network.TESTNET:
      return 'testnet';
    case Network.DEVNET:
      return 'devnet';
    case Network.MAINNET:
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
