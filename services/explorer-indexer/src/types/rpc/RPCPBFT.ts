import { IPBFT } from '@taraxa_project/explorer-shared';

export interface RPCPbft
  extends Pick<
    IPBFT,
    | 'hash'
    | 'gasLimit'
    | 'gasUsed'
    | 'extraData'
    | 'logsBloom'
    | 'mixHash'
    | 'nonce'
    | 'recepitsRoot'
    | 'sha3Uncles'
    | 'stateRoot'
    | 'transactionsRoot'
  > {
  author: string;
  difficulty: string; //hex
  miner: string;
  number: string; //hex
  parentHash: string;
  size: string; //hex
  timestamp: string; //hex
  totalDifficulty: string; //hex
  uncles: string[];
  transactions: string[];
}
