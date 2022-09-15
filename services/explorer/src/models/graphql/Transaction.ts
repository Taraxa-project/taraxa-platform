import { PbftBlock } from './Block';

export interface Transaction {
  hash: string;
  nonce?: number;
  index?: number;
  value?: number;
  gasPrice?: number;
  gas?: number;
  inputData?: number;
  block?: PbftBlock;
  status?: number;
  gasUsed?: number;
  cumulativeGasUsed?: number;
}
