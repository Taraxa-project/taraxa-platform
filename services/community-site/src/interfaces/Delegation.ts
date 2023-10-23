import { ethers } from 'ethers';

export interface DelegationGQL {
  id: string;
  delegator: string;
  validator: string;
  amount: ethers.BigNumber;
  timestamp: number;
}

export const COMMISSION_CHANGE_THRESHOLD = 108000;
