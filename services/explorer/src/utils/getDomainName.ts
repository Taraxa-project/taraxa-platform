import { NetworkName } from '@taraxa_project/taraxa-sdk';

export const getDomainName = (): NetworkName => {
  const hostName = window.location.hostname;
  const network = hostName.split('.')[0];
  if (network === 'mainnet') {
    return NetworkName.MAINNET;
  }
  if (network === 'devnet') {
    return NetworkName.DEVNET;
  }
  if (network === 'testnet') {
    return NetworkName.TESTNET;
  }
  return null;
};
