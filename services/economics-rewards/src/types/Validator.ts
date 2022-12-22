export interface ValidatorBasicInfo {
  total_stake: string;
  commission_reward: string;
  commission: string;
  last_commission_change: string;
  owner: string;
  description: string;
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
