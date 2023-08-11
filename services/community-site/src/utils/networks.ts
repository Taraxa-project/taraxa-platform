interface Network {
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
}
interface Networks {
  [key: number]: Network;
}
export const networks: Networks = {
  841: {
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
  },
  842: {
    chainName: 'Taraxa Testnet',
    rpcUrl: 'https://rpc.testnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://testnet.explorer.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer.testnet.taraxa.io',
  },
  843: {
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
  },
  200: {
    chainName: 'Taraxa PRnet',
    rpcUrl: 'https://rpc-pr-2460.prnet.taraxa.io/',
    iconUrl: 'https://community.taraxa.io/logo192.png',
    blockExplorerUrl: 'https://explorer-pr-2460.prnet.taraxa.io/',
    nativeCurrency: {
      name: 'TARA',
      symbol: 'TARA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer-pr-2460.prnet.taraxa.io',
  },
};
