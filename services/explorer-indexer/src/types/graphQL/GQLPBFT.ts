import { IPBFT } from '@taraxa_project/explorer-shared';
import { IGQLTransaction } from './GQLTransaction';

export interface IGQLPBFT
  extends Omit<
    IPBFT,
    'id' | 'parent' | 'miner' | 'transactions' | 'sha3Uncles'
  > {
  parent?: {
    hash?: string;
  };
  miner?: {
    address?: string;
  };
  transactions?: IGQLTransaction[];
  ommerHash?: string;
}
