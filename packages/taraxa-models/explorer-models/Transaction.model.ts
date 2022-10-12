import { IPBFT } from './PBFT.model';

export interface ITransaction {
  id?: number;
  hash: string;
  nonce?: number;
  index?: number;
  value?: string;
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
