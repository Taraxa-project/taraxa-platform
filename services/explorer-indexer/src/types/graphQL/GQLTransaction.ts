import { ITransaction } from '@taraxa_project/explorer-shared';

export interface IGQLTransaction
  extends Omit<ITransaction, 'id' | 'from' | 'to'> {
  from?: {
    address?: string;
  };
  to?: {
    address?: string;
  };
  input?: string;
  transactionIndex?: string;
}
