import { ethers } from 'ethers';

interface ContractDelegationInfo {
  rewards: ethers.BigNumber;
  stake: ethers.BigNumber;
}

export interface ContractDelegation {
  account: string;
  delegation: ContractDelegationInfo;
}

export interface Delegation {
  address: string;
  stake: ethers.BigNumber;
  rewards: ethers.BigNumber;
}
