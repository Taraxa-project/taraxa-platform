export enum TransactionStatus {
  SUCCESS = '0x0',
  FAILURE = '0x1',
  IN_PROGRESS = '0x',
}

export interface TransactionData {
  timestamp: string;
  block: string;
  status: TransactionStatus;
  txHash: string;
  value: string;
  token: string;
}

export interface ColumnData {
  path: string;
  name: string;
}

export interface BlockData {
  timestamp: string;
  block: string;
  txHash: string;
  transactionCount: number;
}
