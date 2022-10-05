import { Logger } from '@nestjs/common';
import { WebSocketClient } from 'nestjs-websocket';
import { Topics } from 'src/modules/node/nodeSyncer.service';
import util from 'util';

export enum ResponseTypes {
  NewDagBlockFinalizedResponse = 'NewDagBlockFinalizedResponse',
  NewPbftBlockResponse = 'NewPbftBlockResponse',
  NewDagBlockResponse = 'NewDagBlockResponse',
}

export function checkType(object: BaseResponseRype): string {
  if (!object) return;
  return object.subscription
    ? object.subscription === '0x1'
      ? ResponseTypes.NewDagBlockResponse
      : object.subscription === '0x2'
      ? ResponseTypes.NewDagBlockFinalizedResponse
      : object.subscription === '0x3' || object.subscription === '0x4'
      ? ResponseTypes.NewPbftBlockResponse
      : ''
    : '';
}

export interface NewDagBlockFinalizedResponse {
  block: string; //block hash
  period: string; // hex number of period of which the PBFT was created
}

export interface NewPbftBlockResponse {
  hash: string;
  number: string; // hex number
  gasLimit?: string; // hex number
  gasUsed?: string; // hex number
  parent?: string;
  nonce?: string; // hex number
  difficulty?: string; // hex number
  totalDifficulty?: string; // hex number
  miner?: string;
  transactionCount?: string; // hex number
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
  uncles: string[];
}

export interface NewDagBlockResponse {
  hash: string;
  pivot?: string;
  tips?: string[];
  level?: number;
  period?: number;
  signature?: string;
  vdf?: number;
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
    | NewPbftBlockResponse
    | NewDagBlockFinalizedResponse;
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
          result: response.params.result as NewPbftBlockResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newPbftBlockData;
        break;
      }
      case '0x4': {
        // NEW_HEADS
        const newHeadsData = {
          result: response.params.result as NewPbftBlockResponse,
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
