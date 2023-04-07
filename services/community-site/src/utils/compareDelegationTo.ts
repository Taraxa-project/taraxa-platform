import { ethers } from 'ethers';

export const compareDelegationTo = (delegation: string, to = '1000'): boolean => {
  if (!delegation) {
    return false;
  }
  const value = delegation || '0';
  const [integerPart] = value.split('.');
  const integerBigNumber = ethers.BigNumber.from(integerPart || '0');
  return integerBigNumber.lt(ethers.BigNumber.from(to));
};
