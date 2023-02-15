export interface DelegatorInfo {
  // Number of tokens that were staked
  stake: string;
  // Number of tokens that were rewarded
  rewards: string;
}

export interface DelegationData {
  // Validator's(in case of getDelegations) or Delegator's (in case of getValidatorDelegations) account address
  account: string;
  // Delegation info
  delegation: DelegatorInfo;
}

export interface Delegator {
  id?: number;
  blockNumber: number;
  blockTimestamp: number;
  blockHash: string;
  delegator: string;
  validator: string;
  stake: string;
  rewards: string;
}
