import { ITaraxaNode } from '@taraxa_project/explorer-shared';

export const MAINNET_API = `${process.env.REACT_APP_MAINNET_API_HOST}`;
export const TESTNET_API = `${process.env.REACT_APP_TESTNET_API_HOST}`;
export const DEVNET_API = `${process.env.REACT_APP_DEVNET_API_HOST}`;

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

export type FetchNodesFilter = {
  take: number;
  skip: number;
};

export type FetchNodesPagination = {
  rowsPerPage: number;
  page: number;
};

export interface NodesPaginate {
  data: ITaraxaNode[];
  total: number;
}

export interface RankedNode extends ITaraxaNode {
  rank: number;
}
