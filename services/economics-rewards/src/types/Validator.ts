export interface ValidatorBasicInfo {
  // Total number of delegated tokens to the validator
  total_stake: string;
  // Validator's reward from delegators rewards commission
  commission_reward: string;
  // Validator's commission - max value 1000(precision up to 0.1%)
  commission: string;
  // Block number of last commission change
  last_commission_change: string;
  // Validator's owner account
  owner: string;
  // Validators description/name
  description: string;
  // Validators website endpoint
  endpoint: string;
}

export interface ValidatorData {
  account: string;
  info: ValidatorBasicInfo;
}

export interface Validator {
  id?: number;
  blockNumber: number;
  blockTimestamp: number;
  blockHash: string;
  account: string;
  commission: string;
  commissionReward: string;
}
