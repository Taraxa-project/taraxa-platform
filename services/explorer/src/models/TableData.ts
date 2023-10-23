import { BigNumber } from 'ethers';

export enum TransactionStatus {
  SUCCESS = '0x1',
  FAILURE = '0x0',
  NOT_YET_FINALIZED = '0x',
  LOADING = '',
}

export interface TransactionTableData {
  timestamp: number;
  block: string;
  status: TransactionStatus;
  txHash: string;
  value: string;
  token: string;
}

export interface TransactionTableRow {
  timestamp: JSX.Element;
  block: JSX.Element;
  status: JSX.Element;
  txHash: JSX.Element;
  value: string;
}

export interface DagTableRow {
  timestamp: JSX.Element;
  level: number;
  hash: JSX.Element;
  transactionCount: number;
}

export interface PbftTableRow {
  timestamp: JSX.Element;
  block: JSX.Element;
  hash: JSX.Element;
  transactionCount: number;
}

export interface NodesTableData {
  rank: number;
  address: string;
  pbftCount: number;
}

export interface HoldersTableData {
  rank: number;
  address: string;
  balance: BigNumber;
  totalSupply: BigNumber;
  taraPrice: number;
}

export interface ColumnData {
  path: string;
  name: string;
}

export interface BlockData {
  timestamp: number | string;
  block?: number;
  level?: number;
  number?: number;
  hash: string;
  transactionCount: number;
}

export interface BlockDetails extends BlockData {
  period: string;
  pivot: string;
  sender: string;
  signature: string;
  verifiableDelay: number;
}
