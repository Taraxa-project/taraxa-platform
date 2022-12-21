import { BigNumber } from 'ethers';

export interface StakingEvent {
  id: string;
  user: string;
  timestamp: number;
  amount: BigNumber;
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

export interface StakingSummary {
  user: string;
  finalStakes: BigNumber;
  undelegated?: BigNumber;
}

export interface DelegationWarning {
  userId: string;
  address: string;
  stakedAmount: BigNumber;
  delegatedAmount: BigNumber;
  undelegated: BigNumber;
  email?: string;
}

export interface DelegationData {
  user: string;
  address: string;
  value: string;
}

export interface UserData {
  user: string;
  address: string;
  email: string;
}
