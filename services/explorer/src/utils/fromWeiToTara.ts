import { BigNumber, ethers } from 'ethers';

export const MIN_WEI_TO_CONVERT = Math.pow(10, 18);

export const fromWeiToTara = (amount: string | number | BigNumber): string => {
  if (!amount) {
    return;
  }
  const result = Number(ethers.utils.formatEther(amount));
  return result === 0 || result % 1 === 0
    ? `${result}`
    : parseFloat(result?.toFixed(4))?.toString();
};

export const displayWeiOrTara = (
  amount: string | number | BigNumber
): string => {
  if (amount !== undefined && amount !== null) {
    return Number(amount) < MIN_WEI_TO_CONVERT
      ? `${amount} Wei`
      : `${fromWeiToTara(ethers.BigNumber.from(amount))} TARA`;
  }
  return 'NA';
};
