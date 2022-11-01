import { IDAG } from '@taraxa_project/explorer-shared';
import { IGQLTransaction } from './GQLTransaction';

export interface IGQLDag extends Omit<IDAG, 'id' | 'author' | 'transactions'> {
  author?: {
    address: string;
  };
  transactions?: IGQLTransaction[];
}
