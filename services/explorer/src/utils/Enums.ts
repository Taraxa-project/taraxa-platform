export enum RequestLimit {
  ONE = 1,
  TWO = 2,
  FIVE = 5,
  SEVEN = 7,
}

export enum HashLinkType {
  TRANSACTIONS = 'tx',
  BLOCKS = 'block',
  PBFT = 'pbft',
  ADDRESSES = 'address',
}

export const SELECTED_NETWORK = 'SELECTED_NETWORK';

export enum Network {
  TESTNET = 'Californicum Testnet',
  DEVNET = 'Californicum Devnet',
  MAINNET = 'Mainnet Candidate',
}

export enum NetworkGraphQLEndpoints {
  MAINNET = 'https://graphql.mainnet.taraxa.io/',
  TESTNET = 'https://graphql.testnet.taraxa.io/',
  DEVNET = 'https://graphql.devnet.taraxa.io/',
}

export enum ENVIRONMENT {
  LOCALHOST = 'localhost',
  QA = 'qa',
  PROD = 'prod',
}
