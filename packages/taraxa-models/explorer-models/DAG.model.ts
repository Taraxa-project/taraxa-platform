import { ITransaction } from './Transaction.model';

export interface IDAG {
  id?: number;
  hash: string;
  pivot?: string;
  tips?: string[];
  level?: number;
  pbftPeriod?: number;
  timestamp: number;
  author?: string;
  signature?: string;
  vdf?: number;
  transactionCount?: number;
  transactions?: ITransaction[];
}
