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
}

export interface ITransactionWithData
  extends Omit<
    IGQLTransaction,
    | 'input'
    | 'transactionIndex'
    | 'blockHash'
    | 'blockNumber'
    | 'transactionIndex'
  > {
  gasUsed?: string;
  block?: {
    number: number;
    hash: string;
    timestamp: number;
  };
  logs?: {
    index?: string;
    topic?: string;
    data?: string;
  };
}
