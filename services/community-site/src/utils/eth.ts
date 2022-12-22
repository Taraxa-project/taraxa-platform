import { ethers } from "ethers";

export const ethToWei = (val: string) =>
  ethers.BigNumber.from(val).mul(ethers.BigNumber.from(10).pow(18));
export const weiToEth = (val: ethers.BigNumberish) =>
  ethers.utils.formatUnits(val, "ether");
export const formatEth = (val: ethers.BigNumberish) =>
  ethers.utils.commify(val.toString());
export const roundEth = (val: string) => (+val).toFixed(4);
