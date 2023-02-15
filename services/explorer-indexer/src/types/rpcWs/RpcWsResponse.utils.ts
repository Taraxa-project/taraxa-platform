import { Logger } from '@nestjs/common';
import { WebSocketClient } from '@0xelod/nestjs-websocket';
import util from 'util';
import { ResponseTypes, Subscriptions, Topics } from './RpcWsResponse.enums';
import {
  BaseResponseRype,
  NewPbftBlockHeaderResponse,
  RpcResponseData,
} from './RpcWsResponse.interfaces';

export function checkType(object: BaseResponseRype): string {
  if (!object) return;
  return object.subscription === Subscriptions.NEW_HEADS
    ? ResponseTypes.NewHeadsReponse
    : ResponseTypes.NewHeadsReponse;
}

export const toObject = (
  data: WebSocketClient.Data,
  unrecognizedDataCb: (msg: string) => void,
  logger: Logger
) => {
  const response = JSON.parse(data.toString()) as RpcResponseData;

  switch (response.result) {
    case Subscriptions.NEW_HEADS:
      logger.log(`Subscription to Topic ${Topics.NEW_HEADS} successful!`);
      break;
  }
  let returnObj;
  if (response.params) {
    switch (response.params.subscription) {
      case Subscriptions.NEW_HEADS: {
        // NEW_HEADS
        const newHeadsData = {
          result: response.params.result as NewPbftBlockHeaderResponse,
          subscription: response.params.subscription,
        } as BaseResponseRype;
        returnObj = newHeadsData;
        break;
      }
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
