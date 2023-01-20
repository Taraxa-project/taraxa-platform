import { BigNumber, ethers } from 'ethers';

export const MIN_WEI_TO_CONVERT = 1000000;

export const fromWeiToTara = (amount: string | number | BigNumber): string => {
  if (!amount) {
    return;
  }
  const result = Number(ethers.utils.formatEther(amount));
  return result === 0 || result % 1 === 0 ? `${result}` : result?.toFixed(4);
};
