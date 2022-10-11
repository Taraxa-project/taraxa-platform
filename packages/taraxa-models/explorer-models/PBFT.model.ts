import { ITransaction } from './Transaction.model';

export interface IPBFT {
  hash: string;
  number: number;
  timestamp: number;
  reward?: number;
  gasLimit?: number | string;
  gasUsed?: number | string;
  parent?: string;
  nonce?: string;
  difficulty?: number;
  totalDifficulty?: number;
  miner?: string;
  transactionCount?: number;
  transactions?: ITransaction[];
}
