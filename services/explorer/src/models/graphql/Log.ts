import { Account } from './Account';
import { Transaction } from './Transaction';

export interface Log {
  index: number;
  account: Account;
  topics: string[];
  data: string;
  transaction: Transaction;
}
