import { ethers } from 'ethers';

export interface ContractUndelegation {
  validator: string;
  stake: ethers.BigNumber;
  block: ethers.BigNumber;
  validatorExists: boolean;
}

export default interface Undelegation {
  address: string;
  stake: ethers.BigNumber;
  block: number;
}
