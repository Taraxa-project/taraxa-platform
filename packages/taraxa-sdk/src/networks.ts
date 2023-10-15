export enum NetworkName {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
  DEVNET = 'Devnet',
}
export interface Network {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  iconUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  indexerUrl: string;
  graphqlUrl: string;
  faucetUrl: string;
}
export interface Networks {
  [key: number]: Network;
}

export const networks: Networks = {
  841: {
    chainId: 841,
    chainName: 'Taraxa Mainnet',
    rpcUrl: 'https://rpc.mainnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://mainnet.explorer.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer.mainnet.explorer.taraxa.io',
    graphqlUrl: 'https://graphql.mainnet.taraxa.io/',
    faucetUrl: '',
  },
  842: {
    chainId: 842,
    chainName: 'Taraxa Testnet',
    rpcUrl: 'https://rpc.testnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://testnet.explorer.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer.testnet.explorer.taraxa.io',
    graphqlUrl: 'https://graphql.testnet.taraxa.io/',
    faucetUrl: 'https://faucet-testnet.explorer.taraxa.io/',
  },
  843: {
    chainId: 843,
    chainName: 'Taraxa Devnet',
    rpcUrl: 'https://rpc.devnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://devnet.explorer.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer.devnet.explorer.taraxa.io',
    graphqlUrl: 'https://graphql.devnet.taraxa.io/',
    faucetUrl: 'https://faucet-devnet.explorer.taraxa.io/',
  },
};

export const networkNameToId: { [key in NetworkName]: number } = {
  [NetworkName.MAINNET]: 841,
  [NetworkName.TESTNET]: 842,
  [NetworkName.DEVNET]: 843,
};

export const getNetwork = (name: NetworkName): Network | null => {
  const id = networkNameToId[name];
  return networks[id] || null;
};

export const getNetworkById = (chainId: number): Network | null => {
  return networks[chainId] || null;
};

export const getNetworkSubdomain = (network: NetworkName): string => {
  switch (network) {
    case NetworkName.TESTNET:
      return 'testnet';
    case NetworkName.DEVNET:
      return 'devnet';
    case NetworkName.MAINNET:
      return 'mainnet';
    default:
      return '';
  }
};

export const DPOS_CONTRACT_ADDRESS =
  '0x00000000000000000000000000000000000000fe';

export enum ProviderType {
  WEB3 = 'WEB3',
  RPC = 'RPC',
}
