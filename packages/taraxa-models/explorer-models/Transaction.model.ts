import { IPBFT } from './PBFT.model';

export interface ITransaction {
  hash: string;
  nonce?: number;
  index?: number;
  value?: number;
  gasPrice?: number;
  gas?: number;
  inputData?: number;
  block?: IPBFT;
  status?: number;
  gasUsed?: number;
  cumulativeGasUsed?: number;
  from?: string;
  to?: string;
}
