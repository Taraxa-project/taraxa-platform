export interface RPCPbft {
  author: string;
  difficulty: string; //hex
  extraData: string;
  gasLimit: string; //hex
  gasUsed: string; //hex
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string; //hex
  parentHash: string;
  recepitsRoot: string;
  sha3Uncles: string;
  size: string; //hex
  stateRoot: string;
  timestamp: string; //hex
  totalDifficulty: string; //hex
  transactionsRoot: string;
  uncles: string[];
  transactions: string[];
}
