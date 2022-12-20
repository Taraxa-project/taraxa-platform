export interface DelegationData {
  stake: string | number;
  block: number;
  validator: string;
}

export interface Delegation {
  account: string;
  delegation: DelegationData;
}
