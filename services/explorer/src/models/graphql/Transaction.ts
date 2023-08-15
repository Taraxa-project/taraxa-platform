import { BigNumber } from 'ethers';
import { Account } from './Account';
import { PbftBlock } from './Block';
import { Log } from './Log';

export interface Transaction {
  hash: string;
  nonce?: number;
  index?: number;
  value?: number | BigNumber | string;
  gasPrice?: number | BigNumber | string;
  gas?: number | BigNumber | string;
  gasCost?: number | BigNumber | string;
  inputData?: number | string;
  block?: Partial<PbftBlock>;
  status?: number;
  gasUsed?: number;
  cumulativeGasUsed?: number;
  from?: Partial<Account>;
  to?: Partial<Account>;
  createdContract?: Partial<Account>;
  logs?: Log[];
  type?: 0 | 1 | 2;
  action?: string;
}
