import { TransactionEntity } from '@taraxa_project/explorer-shared';

export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  status: number;
  gasUsed: string;
  gasPrice: string;
  value: string;
  block: number;
  age: number;
}

export interface TransactionsPaginate {
  data: TransactionEntity[];
  total: number;
}
