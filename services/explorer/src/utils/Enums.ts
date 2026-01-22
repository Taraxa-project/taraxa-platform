export enum HashLinkType {
  TRANSACTIONS = 'tx',
  BLOCKS = 'block',
  PBFT = 'pbft',
  ADDRESSES = 'address',
}

export const SELECTED_NETWORK = 'SELECTED_NETWORK';

export enum Network {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
  DEVNET = 'Devnet',
}

export enum NetworkGraphQLEndpoints {
  MAINNET = 'https://graphql.mainnet.taraxa.io/',
  TESTNET = 'https://graphql.testnet.taraxa.io/',
  DEVNET = 'https://graphql.devnet.taraxa.io/',
}
