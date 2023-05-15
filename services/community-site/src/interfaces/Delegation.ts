import { ethers } from 'ethers';

interface ContractDelegationInfo {
  rewards: ethers.BigNumber;
  stake: ethers.BigNumber;
}

export interface ContractDelegation {
  account: string;
  delegation: ContractDelegationInfo;
}

export default interface Delegation {
  address: string;
  stake: ethers.BigNumber;
  rewards: ethers.BigNumber;
}

export interface DelegationGQL {
  id: string;
  delegator: string;
  validator: string;
  amount: ethers.BigNumber;
  date: number;
}

export const COMMISSION_CHANGE_THRESHOLD = 108000;
