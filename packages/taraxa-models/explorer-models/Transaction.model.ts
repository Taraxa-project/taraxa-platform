import { IPBFT } from './PBFT.model';

export interface ITransaction {
  hash: string;
  nonce?: number;
  index?: number;
  value?: number;
  gasPrice?: string;
  gas?: string;
  inputData?: string;
  block?: IPBFT;
  status?: number;
  gasUsed?: string;
  cumulativeGasUsed?: number;
  from?: string;
  to?: string;
  r?: string;
  v?: string; // hex
  s?: string;
  blockHash?: string;
  blockNumber?: string;
  input?: string;
  transactionIndex?: string;
}
