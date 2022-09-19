export enum TransactionStatus {
  SUCCESS = '0x0',
  FAILURE = '0x1',
  IN_PROGRESS = '0x',
}

export interface TransactionTableData {
  timestamp: string;
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
  timestamp: string;
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
