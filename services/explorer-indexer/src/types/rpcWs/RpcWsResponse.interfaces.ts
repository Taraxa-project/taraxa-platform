import { IDAG, IPBFT } from '@taraxa_project/explorer-shared';

export interface NewDagBlockFinalizedResponse {
  block: string; //block hash
  period: string; // hex number of period of which the PBFT was created
}

export interface NewPbftBlockHeaderResponse
  extends Omit<
    IPBFT,
    | 'id'
    | 'number'
    | 'difficulty'
    | 'totalDifficulty'
    | 'transactionCount'
    | 'transactions'
    | 'timestamp'
    | 'size'
  > {
  number?: string; // hex number
  gas_limit?: string | number; // hex number
  gas_used?: string | number; // hex number
  difficulty?: string; // hex number
  totalDifficulty?: string; // hex number
  transactionCount?: string; // hex number
  transactions?: string[];
  author?: string; // block auther, same as miner
  extra_data?: string; // encoded extra data
  log_bloom?: string; // logs
  parent_hash?: string;
  parentHash?: string;
  receipts_root?: string;
  receiptsRoot?: string;
  size?: string; // hex number
  state_root?: string;
  timestamp?: string; // hex number
  transactions_root?: string;
  uncles_hash?: string[];
  uncles?: string[];
  ethereum_rlp_size?: number;
}

export interface NewPbftBlockResponse {
  pbft_block: {
    beneficiary: string;
    block_hash: string;
    dag_block_hash_as_pivot: string;
    order_hash: string;
    period: number;
    prev_block_hash: string;
    reward_votes: string[];
    schedule: {
      dag_blocks_order: string[];
    };
    singature: string;
    timestamp: number;
  };
}

export interface NewDagBlockResponse
  extends Omit<IDAG, 'pbftPeriod' | 'vdf' | 'timestamp' | 'transactions'> {
  period?: number;
  sig?: string;
  vdf?: {
    difficulty: string;
    proof: string;
  };
  transactions?: string[];
  sender: string; // block author, same as miner
  extraData: string; // encoded extra data
  logsBloom: string; // logs
  mixHash: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string; // hex number
  stateRoot: string;
  timestamp: string; // hex number
  transactionsRoot: string;
}

export interface BaseResponseRype {
  subscription: string; // hex number of subscription. Incremental on the subscriptions that are sent.
  result:
    | NewDagBlockResponse
    | NewPbftBlockHeaderResponse
    | NewDagBlockFinalizedResponse
    | NewPbftBlockResponse
    | string;
}
export interface RpcResponseData {
  result: any;
  params: BaseResponseRype;
}

export interface RpcWsReponse {
  jsonRpc: string; // jsonRpc version
  method: string; //rpc method
  params: RpcResponseData;
}
