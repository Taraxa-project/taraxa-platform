import { Account } from './Account';
import { Transaction } from './Transaction';

export interface PbftBlock {
  hash: string;
  number: number;
  timestamp: number;
  gasLimit?: number;
  gasUsed?: number;
  parent?: PbftBlock;
  nonce?: string;
  transactionCount?: number;
  transactions?: Transaction[];
}

export interface DagBlock {
  hash: string;
  pivot?: string;
  tips?: string[];
  level?: number;
  pbftPeriod?: number;
  timestamp: number;
  block?: string;
  author?: Account;
  transactionCount?: number;
  transactions?: Transaction[];
}
