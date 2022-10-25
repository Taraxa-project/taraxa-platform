import { ITaraxaNode } from '@taraxa_project/explorer-shared';

export const GRAPHQL_API = `${process.env.REACT_APP_GRAPHQL_HOST}`;
export const API = `${process.env.REACT_APP_API_HOST}`;

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
