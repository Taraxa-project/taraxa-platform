import { Validator } from './Validator';

export interface Reward extends Validator {
  id?: number;
  blockNumber: number;
  blockTimestamp: number;
  blockHash: string;
}
