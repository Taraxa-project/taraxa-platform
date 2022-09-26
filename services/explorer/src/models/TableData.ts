export enum TransactionStatus {
  SUCCESS = '0x1',
  FAILURE = '0x0',
  NOT_YET_MINED = '0x',
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

export interface NodesTableData {
  rank: number;
  nodeAddress: string;
  blocksProduced: number;
}

export interface ColumnData {
  path: string;
  name: string;
}

export interface BlockData {
  timestamp: number | string;
  block?: number;
  level?: number;
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
