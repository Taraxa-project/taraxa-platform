import { Validator } from './Validator';

export interface Reward extends Validator {
  blockNumber: number;
  blockTimestamp: number;
  blockHash: string;
}
