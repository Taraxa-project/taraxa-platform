import { Logger } from '@nestjs/common';
import { WebSocketClient } from '@0xelod/nestjs-websocket';
import util from 'util';
import { ResponseTypes, Subscriptions, Topics } from './RpcWsResponse.enums';
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
  // return object.subscription
  //  ?  ? object.subscription === Subscriptions.NEW_DAG_BLOCKS
  // ? ResponseTypes.NewDagBlockResponse
  // : object.subscription === Subscriptions.NEW_DAG_BLOCKS_FINALIZED
  // ? ResponseTypes.NewDagBlockFinalizedResponse
  // : object.subscription === Subscriptions.NEW_PBFT_BLOCKS
  // ResponseTypes.NewPbftBlockResponse
  // : object.subscription === Subscriptions.NEW_HEADS
  //?  ? ResponseTypes.NewHeadsReponse
  // : object.subscription === Subscriptions.NEW_PENDING_TRANSACTIONS
  //  ResponseTypes.NewPendingTransactions
  //: '';
  return object.subscription === Subscriptions.NEW_HEADS
    ? ResponseTypes.NewHeadsReponse
    : ResponseTypes.NewHeadsReponse;
  // : '';
}

export const toObject = (
  data: WebSocketClient.Data,
  unrecognizedDataCb: (msg: string) => void,
  logger: Logger
) => {
  const response = JSON.parse(data.toString()) as RpcResponseData;

  switch (response.result) {
    // case Subscriptions.NEW_DAG_BLOCKS:
    //   logger.log(`Subscription to Topic ${Topics.NEW_DAG_BLOCKS} successful!`);
    //   break;
    // case Subscriptions.NEW_DAG_BLOCKS_FINALIZED:
    //   logger.log(
    //     `Subscription to Topic ${Topics.NEW_DAG_BLOCKS_FINALIZED} successful!`
    //   );
    //   break;
    // case Subscriptions.NEW_PBFT_BLOCKS:
    //   logger.log(`Subscription to Topic ${Topics.NEW_PBFT_BLOCKS} successful!`);
    //   break;
    case Subscriptions.NEW_HEADS:
      logger.log(`Subscription to Topic ${Topics.NEW_HEADS} successful!`);
      break;
  }
  let returnObj;
  if (response.params) {
    switch (response.params.subscription) {
      // case Subscriptions.NEW_DAG_BLOCKS: {
      //   // NEW_DAG_BLOCKS
      //   const newDagData = {
      //     result: response.params.result as NewDagBlockResponse,
      //     subscription: response.params.subscription,
      //   } as BaseResponseRype;
      //   returnObj = newDagData;
      //   break;
      // }
      // case Subscriptions.NEW_DAG_BLOCKS_FINALIZED: {
      //   // NEW_DAG_BLOCKS_FINALIZED
      //   const newDagBlocksFinalizedData = {
      //     result: response.params.result as NewDagBlockFinalizedResponse,
      //     subscription: response.params.subscription,
      //   } as BaseResponseRype;
      //   returnObj = newDagBlocksFinalizedData;
      //   break;
      // }
      // case Subscriptions.NEW_PBFT_BLOCKS: {
      //   // NEW_PBFT_BLOCKS
      //   const newPbftBlockData = {
      //     result: response.params.result as NewPbftBlockResponse,
      //     subscription: response.params.subscription,
      //   } as BaseResponseRype;
      //   returnObj = newPbftBlockData;
      //   break;
      // }
      case Subscriptions.NEW_HEADS: {
        // NEW_HEADS
        const newHeadsData = {
          result: response.params.result as NewPbftBlockHeaderResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newHeadsData;
        break;
      }
      // case Subscriptions.NEW_PENDING_TRANSACTIONS: {
      //   // NEW_HEADS
      //   const newTxData = {
      //     result: response.params.result as string,
      //     subscription: response.params.subscription,
      //   } as BaseResponseRype;
      //   returnObj = newTxData;
      //   break;
      // }
      default: {
        const newHeadsData = {
          result: response.params.result as NewPbftBlockHeaderResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        if (!newHeadsData) {
          unrecognizedDataCb(
            `Unrecognized data: ${util.inspect(response.params.result)}`
          );
        } else {
          returnObj = newHeadsData;
        }
        break;
      }
    }
  }
  return returnObj;
};
