import { TransactionStatus } from './TableData';

export interface TransactionData {
  txHash: string;
  status: TransactionStatus;
  timestamp: number;
  pbftBlock: string;
  dagLevel: string;
  dagHash: string;
  value: string;
  from: string;
  gasLimit: string;
  gas: string;
  gasPrice: string;
  to: string;
  nonce: number;
}
