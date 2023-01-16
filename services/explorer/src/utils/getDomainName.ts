import { Network } from './Enums';

export const getDomainName = (): Network => {
  const hostName = window.location.hostname;
  const network = hostName.split('.')[0];
  if (network === 'mainnet') {
    return Network.MAINNET;
  }
  if (network === 'devnet') {
    return Network.DEVNET;
  }
  if (network === 'testnet') {
    return Network.TESTNET;
  }
  return null;
};
