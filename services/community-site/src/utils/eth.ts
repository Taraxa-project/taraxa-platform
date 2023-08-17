import { ethers } from 'ethers';

export const weiToEth = (val: ethers.BigNumberish) => ethers.utils.formatUnits(val, 'ether');
export const formatEth = (val: ethers.BigNumberish) => ethers.utils.commify(val.toString());
export const roundEth = (val: string) => (+val).toFixed(4);
export const stripEth = (val: ethers.BigNumberish) =>
  ethers.utils
    .commify(weiToEth(val))
    .slice(0, ethers.utils.commify(weiToEth(val)).indexOf('.') + 3);
