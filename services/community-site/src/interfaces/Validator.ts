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
}
