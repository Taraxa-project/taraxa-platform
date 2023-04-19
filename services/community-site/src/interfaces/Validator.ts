import { ethers } from 'ethers';

interface ContractValidatorInfo {
  owner: string;
  commission: number;
  total_stake: ethers.BigNumber;
  commission_reward: ethers.BigNumber;
  last_commission_change: number;
  description: string;
  endpoint: string;
}

export interface ContractValidator {
  account: string;
  info: ContractValidatorInfo;
}

export enum ValidatorStatus {
  NOT_ELIGIBLE = 'not-eligible',
  ELIGIBLE_INACTIVE = 'eligible-inactive',
  ELIGIBLE = 'eligible',
}

export interface Validator {
  address: string;
  owner: string;
  commission: number;
  commissionReward: ethers.BigNumber;
  lastCommissionChange: number;
  delegation: ethers.BigNumber;
  availableForDelegation: ethers.BigNumber;
  description: string;
  endpoint: string;
  isFullyDelegated: boolean;
  isActive: boolean;
  status: ValidatorStatus;
  rank: number;
}

export const getValidatorStatusTooltip = (status: ValidatorStatus) => {
  switch (status) {
    case ValidatorStatus.ELIGIBLE:
      return 'Eligible';
    case ValidatorStatus.ELIGIBLE_INACTIVE:
      return 'Eligible but hasn`t produced blocks in the last 24 hours';
    case ValidatorStatus.NOT_ELIGIBLE:
      return 'Not eligible';
    default:
      return 'Not eligible';
  }
};
export interface ValidatorWithStats extends Validator {
  pbftsProduced: number;
  yield: number;
}
