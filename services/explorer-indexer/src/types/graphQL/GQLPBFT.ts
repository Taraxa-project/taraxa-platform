import { IGQLTransaction } from './GQLTransaction';

export interface IGQLPBFT {
  hash: string;
  number: number;
  timestamp: number;
  reward?: string;
  gasLimit?: number | string;
  gasUsed?: number | string;
  parent?: {
    hash?: string;
  };
  nonce?: string;
  difficulty?: number;
  totalDifficulty?: number;
  miner?: {
    address?: string;
  };
  transactionCount?: number;
  transactions?: IGQLTransaction[];
  transactionsRoot?: string;
  extraData?: string;
  logsBloom?: string;
  mixHash?: string;
  recepitsRoot?: string;
  ommerHash?: string;
  size?: number;
  stateRoot?: string;
}
