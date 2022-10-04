import { ITransaction } from './Transaction.model';

export interface IPBFT {
  hash: string;
  number: number;
  timestamp: string | number;
  gasLimit?: number;
  gasUsed?: number;
  parent?: IPBFT;
  nonce?: string;
  difficulty?: number;
  totalDifficulty?: number;
  miner?: string;
  transactionCount?: number;
  transactions?: ITransaction[];
}
