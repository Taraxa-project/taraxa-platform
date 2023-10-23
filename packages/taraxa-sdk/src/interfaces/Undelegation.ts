import { ethers } from 'ethers';

export interface ContractUndelegation {
  validator: string;
  stake: ethers.BigNumber;
  block: ethers.BigNumber;
  validator_exists: boolean;
}

export interface Undelegation {
  address: string;
  stake: ethers.BigNumber;
  block: number;
  validatorExists: boolean;
}
