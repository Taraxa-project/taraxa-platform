export enum RequestLimit {
  ONE = 1,
  TWO = 2,
  FIVE = 5,
  SEVEN = 7,
}

export enum HashLinkType {
  TRANSACTIONS = 'transactions',
  BLOCKS = 'blocks',
  PBFT = 'pbft',
  ADDRESSES = 'address',
}

export const SELECTED_NETWORK = 'SELECTED_NETWORK';

export enum Network {
  TESTNET = 'Californicum Testnet',
  DEVNET = 'Californicum Devnet',
  MAINNET = 'Mainnet Candidate',
}
