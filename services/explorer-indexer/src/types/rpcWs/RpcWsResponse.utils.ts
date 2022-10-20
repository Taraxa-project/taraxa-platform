import { Logger } from '@nestjs/common';
import { WebSocketClient } from 'nestjs-websocket';
import util from 'util';
import { ResponseTypes, Topics } from './RpcWsResponse.enums';
import {
  BaseResponseRype,
  NewDagBlockFinalizedResponse,
  NewDagBlockResponse,
  NewPbftBlockHeaderResponse,
  NewPbftBlockResponse,
  RpcResponseData,
} from './RpcWsResponse.interfaces';

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
      : object.subscription === '0x5'
      ? ResponseTypes.NewPendingTransactions
      : ''
    : '';
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
          result: response.params.result as NewPbftBlockHeaderResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newHeadsData;
        break;
      }
      case '0x5': {
        // NEW_HEADS
        const newTxData = {
          result: response.params.result as string,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newTxData;
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
