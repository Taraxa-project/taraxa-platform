import { ITransaction } from './Transaction.model';

export interface IPBFT {
  id?: number;
  hash: string;
  number: number;
  timestamp: number;
  reward?: string;
  gasLimit?: number | string;
  gasUsed?: number | string;
  parent?: string;
  nonce?: string;
  difficulty?: number;
  totalDifficulty?: number;
  miner?: string;
  transactionCount?: number;
  transactions?: ITransaction[];
  transactionsRoot?: string;
  extraData?: string;
  logsBloom?: string;
  mixHash?: string;
  recepitsRoot?: string;
  sha3Uncles?: string;
  size?: number;
  stateRoot?: string;
}
