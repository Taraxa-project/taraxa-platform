import { ITransaction } from './Transaction.model';

export interface IDAG {
  hash: string;
  pivot?: string;
  tips?: string[];
  level?: number;
  pbftPeriod?: number;
  timestamp: number;
  // block?: string;
  author?: string;
  signature?: string;
  vdf?: number;
  transactionCount?: number;
  transactions?: ITransaction[];
}
