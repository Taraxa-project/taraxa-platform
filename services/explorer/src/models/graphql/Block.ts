import { Account } from './Account';
import { Transaction } from './Transaction';

export interface PbftBlock {
  hash: string;
  number: number;
  timestamp: string | number;
  gasLimit?: number;
  gasUsed?: number;
  parent?: PbftBlock;
  nonce?: string;
  difficulty?: number;
  totalDifficulty?: number;
  miner?: Account;
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
  // block?: string;
  author?: Account;
  signature?: string;
  vdf?: number;
  transactionCount?: number;
  transactions?: Transaction[];
}
