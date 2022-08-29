import { TransactionStatus } from './TableData';

export interface TransactionData {
  status: TransactionStatus;
  timestamp: string;
  pbftBlock: string;
  dagBlock: string;
  value: string;
  from: string;
  gasLimit: string;
  gas: string;
  gasPrice: string;
  to: string;
  nonce: number;
}
