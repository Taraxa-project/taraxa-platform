export interface RPCTransaction {
  blockHash?: string;
  blockNumber?: string; //hex
  from?: string;
  to?: string;
  gas?: string; //hex
  gasPrice?: string; //hex
  hash: string;
  input?: string;
  nonce?: string; //hex
  r?: string;
  v?: string; // hex
  s?: string;
  transactionIndex?: string; //hex
  value?: string; //hex
}
