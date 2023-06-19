import { ethers, BigNumber } from 'ethers';

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

export enum ValidatorType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
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
  pbftsProduced: number;
  yield: number;
  type: ValidatorType;
  ip?: string;
  id?: number;
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

export const calculateValidatorYield = (validators: Validator[]): Validator[] => {
  return validators.map((validator) => {
    const { pbftsProduced, delegation } = validator;
    const d = delegation.div(BigNumber.from(10).pow(18));

    let yieldRatio = BigNumber.from(0);

    if (!d.isZero()) {
      yieldRatio = BigNumber.from(pbftsProduced).mul(BigNumber.from(10).pow(6)).div(d);
    }
    return {
      ...validator,
      yield: Math.round(Number(yieldRatio.toString())),
    } as Validator;
  });
};
