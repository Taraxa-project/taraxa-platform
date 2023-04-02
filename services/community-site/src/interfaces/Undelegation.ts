import { ethers } from 'ethers';

export interface ContractUndelegation {
  validator: string;
  stake: ethers.BigNumber;
  block: ethers.BigNumber;
}

export default interface Undelegation {
  address: string;
  stake: ethers.BigNumber;
  block: number;
}
