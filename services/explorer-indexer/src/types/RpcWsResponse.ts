import { Logger } from '@nestjs/common';
import { WebSocketClient } from 'nestjs-websocket';
import util from 'util';

export enum ResponseTypes {
  NewDagBlockFinalizedResponse = 'NewDagBlockFinalizedResponse',
  NewPbftBlockResponse = 'NewPbftBlockResponse',
  NewDagBlockResponse = 'NewDagBlockResponse',
  NewHeadsReponse = 'NewHeadsReponse',
}

export enum Topics {
  NEW_DAG_BLOCKS = 'newDagBlocks', // @note fired when a DAG block is accepted by the consensus
  NEW_DAG_BLOCKS_FINALIZED = 'newDagBlocksFinalized', // @note fired when a DAG block is inserted into a PBFT block
  NEW_PBFT_BLOCKS = 'newPbftBlocks', // @note fired when a PBFT block is accepted by the consensus
  NEW_HEADS = 'newHeads', // @note fired when a PBFT ns "mined": all transactions inside it were executed
  ERRORS = 'error', // @note error message
}

export enum Subscriptions {
  NEW_DAG_BLOCKS = 1, // @note fired when a DAG block is accepted by the consensus
  NEW_DAG_BLOCKS_FINALIZED = 2, // @note fired when a DAG block is inserted into a PBFT block
  NEW_PBFT_BLOCKS = 3, // @note fired when a PBFT block is accepted by the consensus
  NEW_HEADS = 4, // @note fired when a PBFT ns "mined": all transactions inside it were executed
}

export function checkType(object: BaseResponseRype): string {
  if (!object) return;
  return object.subscription
    ? object.subscription === '0x1'
      ? ResponseTypes.NewDagBlockResponse
      : object.subscription === '0x2'
      ? ResponseTypes.NewDagBlockFinalizedResponse
      : object.subscription === '0x3'
      ? ResponseTypes.NewPbftBlockResponse
      : object.subscription === '0x4'
      ? ResponseTypes.NewHeadsReponse
      : ''
    : '';
}

export interface NewDagBlockFinalizedResponse {
  block: string; //block hash
  period: string; // hex number of period of which the PBFT was created
}

export interface NewPbftBlockHeaderResponse {
  hash: string;
  number: string; // hex number
  gas_limit?: string; // hex number
  gas_used?: string; // hex number
  parent?: string;
  nonce?: string; // hex number
  difficulty?: string; // hex number
  totalDifficulty?: string; // hex number
  miner?: string;
  transactionCount?: string; // hex number
  transactions?: string[];
  author: string; // block auther, same as miner
  extra_data: string; // encoded extra data
  log_bloom: string; // logs
  mixHash: string;
  parent_hash: string;
  receipts_root: string;
  sha3Uncles: string;
  size: string; // hex number
  state_root: string;
  timestamp: string; // hex number
  transactions_root: string;
  uncles_hash: string[];
  ethereum_rlp_size: number;
}

export interface NewPbftBlockResponse {
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
}

export interface NewDagBlockResponse {
  hash: string;
  pivot?: string;
  tips?: string[];
  level?: number;
  period?: number;
  signature?: string;
  vdf?: {
    difficulty: string;
    proof: string;
  };
  transactionCount?: number;
  transactions?: string[];
  author: string; // block auther, same as miner
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
    | NewPbftBlockResponse;
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

export const toObject = (
  data: WebSocketClient.Data,
  unrecognizedDataCb: (msg: string) => void,
  logger: Logger
) => {
  const response = JSON.parse(data.toString()) as RpcResponseData;

  switch (response.result) {
    case '0x1':
      logger.log(`Subscription to Topic ${Topics.NEW_DAG_BLOCKS} successful!`);
      break;
    case '0x2':
      logger.log(
        `Subscription to Topic ${Topics.NEW_DAG_BLOCKS_FINALIZED} successful!`
      );
      break;
    case '0x3':
      logger.log(`Subscription to Topic ${Topics.NEW_PBFT_BLOCKS} successful!`);
      break;
    case '0x4':
      logger.log(`Subscription to Topic ${Topics.NEW_HEADS} successful!`);
      break;
  }
  let returnObj;
  if (response.params) {
    switch (response.params.subscription) {
      case '0x1': {
        // NEW_DAG_BLOCKS
        const newDagData = {
          result: response.params.result as NewDagBlockResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newDagData;
        break;
      }
      case '0x2': {
        // NEW_DAG_BLOCKS_FINALIZED
        const newDagBlocksFinalizedData = {
          result: response.params.result as NewDagBlockFinalizedResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newDagBlocksFinalizedData;
        break;
      }
      case '0x3': {
        // NEW_PBFT_BLOCKS
        const newPbftBlockData = {
          result: response.params.result as NewPbftBlockHeaderResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newPbftBlockData;
        break;
      }
      case '0x4': {
        // NEW_HEADS
        const newHeadsData = {
          result: response.params.result as NewPbftBlockHeaderResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newHeadsData;
        break;
      }
      default:
        unrecognizedDataCb(
          `Unrecognized data: ${util.inspect(response.params.result)}`
        );
        break;
    }
  }
  return returnObj;
};
