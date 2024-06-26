import { ITaraxaNode } from '@taraxa_project/explorer-shared';
import { BlockData, Transaction } from '../models';

export const MAINNET_API = `${process.env.REACT_APP_MAINNET_API_HOST}`;
export const TESTNET_API = `${process.env.REACT_APP_TESTNET_API_HOST}`;
export const DEVNET_API = `${process.env.REACT_APP_DEVNET_API_HOST}`;

export const MAINNET_FAUCET_API = `${process.env.REACT_APP_MAINNET_FAUCET_HOST}`;
export const TESTNET_FAUCET_API = `${process.env.REACT_APP_TESTNET_FAUCET_HOST}`;
export const DEVNET_FAUCET_API = `${process.env.REACT_APP_DEVNET_FAUCET_HOST}`;

export const MAINNET_RPC_API = `${process.env.REACT_APP_TARAXA_MAINNET_PROVIDER}`;
export const TESTNET_RPC_API = `${process.env.REACT_APP_TARAXA_TESTNET_PROVIDER}`;
export const DEVNET_RPC_API = `${process.env.REACT_APP_TARAXA_DEVNET_PROVIDER}`;

export const OVERRIDE_RPC_PROVIDER = `${
  process.env.REACT_APP_OVERRIDE_RPC_PROVIDER ?? ''
}`;
export const OVERRIDE_GRAPHQL = `${
  process.env.REACT_APP_OVERRIDE_GRAPHQL ?? ''
}`;
export const OVERRIDE_API = `${process.env.REACT_APP_OVERRIDE_API ?? ''}`;
export const OVERRIDE_FAUCET = `${process.env.REACT_APP_OVERRIDE_FAUCET ?? ''}`;
export const IS_PRNET = OVERRIDE_RPC_PROVIDER !== '' && OVERRIDE_GRAPHQL !== '';

export const TOKEN_PRICE_API_ENDPOINT = `${
  process.env.REACT_APP_TOKEN_PRICE_API_ENDPOINT ||
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=taraxa`
}`;

export const POOLING_INTERVAL = 15000; // 15 seconds

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

export type FetchWithPagination = {
  start: number;
  limit: number;
};

export type ResultWithPagination<T> = {
  start: number;
  end: number;
  total: number;
  hasNext: boolean;
  data: T[];
};

export type WeekPagination = {
  endDate: number;
  startDate: number;
  hasNext: boolean;
  week: number;
  year: number;
};

export type NodesResultWithPagination<T> = ResultWithPagination<T> & {
  week: WeekPagination;
};

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
  gas: string;
  gasPrice: string;
  value: string;
  block: number;
  age: number;
  timestamp?: number;
  type?: 0 | 1 | 2;
}

export interface HoldersResponse {
  address: string;
  balance: string;
}

export interface RankedNode extends ITaraxaNode {
  rank: number;
  address: string;
  pbftCount: number;
}

export interface Holder {
  rank: number;
  address: string;
  balance: string;
}

export interface Paginate<T> {
  data: T[];
  total: number;
}

export type PbftsPaginate = Paginate<AddressPbftsResponse>;
export type DagsPaginate = Paginate<AddressDagsResponse>;
export type TxPaginate = Paginate<AddressTxResponse>;
export type NodesPaginate = Paginate<ITaraxaNode>;

export interface TablePagination<T> {
  data: T[];
  total: number;
  page: number;
  rowsPerPage: number;
  handleChangePage: (p: number) => void;
  handleChangeRowsPerPage: (l: number) => void;
}

export type BlockTablePagination = TablePagination<BlockData>;
export type TxTablePaginate = TablePagination<Transaction>;

export type ToastData = {
  display: boolean;
  variant?: 'success' | 'error' | 'warning' | undefined;
  text?: string;
};

export type EventData = {
  address: string;
  data: string;
  logIndex: number;
  name: string;
  params: any[];
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
};
