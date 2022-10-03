import { Account } from './Account';
import { PbftBlock } from './Block';
import { Log } from './Log';

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
  from?: Account;
  to?: Account;
  logs?: Log[];
}
