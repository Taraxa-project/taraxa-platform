export interface IPBFT {
  hash: string;
  number: number;
  timestamp: number;
  gasLimit?: number;
  gasUsed?: number;
  parent?: string;
  nonce?: string;
  difficulty?: number;
  totalDifficulty?: number;
  miner?: string;
  transactionCount?: number;
  transactions?: string[];
}
