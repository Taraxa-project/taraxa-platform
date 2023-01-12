import { ITaraxaNode } from '@taraxa_project/explorer-shared';

export const MAINNET_API = `${process.env.REACT_APP_MAINNET_API_HOST}`;
export const TESTNET_API = `${process.env.REACT_APP_TESTNET_API_HOST}`;
export const DEVNET_API = `${process.env.REACT_APP_DEVNET_API_HOST}`;

export const MAINNET_FAUCET_API = `${process.env.REACT_APP_MAINNET_FAUCET_HOST}`;
export const TESTNET_FAUCET_API = `${process.env.REACT_APP_TESTNET_FAUCET_HOST}`;
export const DEVNET_FAUCET_API = `${process.env.REACT_APP_DEVNET_FAUCET_HOST}`;

export type DagBlockFilters = {
  dagLevel: number;
  count?: number;
  reverse?: boolean;
};

export type PbftBlocksFilters = {
  from: number;
  to?: number;
};

export type PbftBlockDetailsFilters = {
  hash?: string;
  number?: number;
};

export type PaginationFilter = {
  take: number;
  skip: number;
};

export type FetchWithPagination = {
  rowsPerPage: number;
  page: number;
};

export interface NodesPaginate {
  data: ITaraxaNode[];
  total: number;
}

export interface AddressPbftsResponse {
  hash: string;
  number: number;
  timestamp: number;
  transactionCount: number;
}

export interface AddressDagsResponse {
  hash: string;
  level: number;
  timestamp: number;
  transactionCount: number;
}

export interface AddressTxResponse {
  hash: string;
  from: string;
  to: string;
  status: number;
  gasUsed: string;
  gasPrice: string;
  value: string;
  block: number;
  age: number;
}

export interface PbftsPaginate {
  data: AddressPbftsResponse[];
  total: number;
}

export interface DagsPaginate {
  data: AddressDagsResponse[];
  total: number;
}

export interface TxPaginate {
  data: AddressTxResponse[];
  total: number;
}

export interface RankedNode extends ITaraxaNode {
  rank: number;
}
