import { IPBFT } from '@taraxa_project/explorer-shared';

export interface IGQLTransaction {
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
  from?: {
    address?: string;
  };
  to?: {
    address?: string;
  };
  r?: string;
  v?: string; // hex
  s?: string;
  blockHash?: string;
  blockNumber?: string;
  input?: string;
  transactionIndex?: string;
}
