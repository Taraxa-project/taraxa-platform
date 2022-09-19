import { TransactionStatus } from './TableData';

export interface TransactionData {
  txHash: string;
  status: TransactionStatus;
  timestamp: number;
  pbftBlock: string;
  block: number;
  dagLevel: string;
  dagHash: string;
  value: string;
  token: string;
  from: string;
  gasLimit: string;
  gas: string;
  gasPrice: string;
  to: string;
  nonce: number;
}
