export interface DelegationData {
  stake: string | number;
  block: number;
  validator: string;
}

export interface Delegation {
  account: string;
  delegation: DelegationData;
}

export interface Delegator {
  id?: number;
  blockNumber: number;
  blockTimestamp: number;
  blockHash: string;
  delegator: string;
  validator: string;
  stake: number;
  rewards: number;
}
