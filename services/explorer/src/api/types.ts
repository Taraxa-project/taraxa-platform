import { ITaraxaNode } from '@taraxa_project/explorer-shared';
import { BlockData, Transaction } from '../models';

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
