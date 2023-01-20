import { ethers } from 'ethers';

export const fromWeiToTara = (amount: string | number) => {
  if (!amount) {
    return;
  }
  return ethers.utils.formatEther(amount);
};
