import { ITransaction } from '@taraxa_project/explorer-shared';

export interface RPCTransaction
  extends Pick<
    ITransaction,
    | 'from'
    | 'to'
    | 'gas'
    | 'gasPrice'
    | 'hash'
    | 'r'
    | 'v'
    | 's'
    | 'transactionIndex'
    | 'value'
  > {
  blockHash?: string;
  blockNumber?: string; //hex
  input?: string;
  nonce?: string; //hex
}
