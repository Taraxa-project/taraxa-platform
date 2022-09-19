import { ethers } from 'ethers';

export interface IdentifierTypes {
  txHash?: string;
  blockNumber?: number;
  address?: string;
}

export const unwrapIdentifier = (identifier: string): IdentifierTypes => {
  const ret: IdentifierTypes = {
    txHash: undefined,
    blockNumber: undefined,
    address: undefined,
  };
  const isNotANumber = Number.isNaN(identifier);
  if (!isNotANumber) ret.blockNumber = +identifier;
  const isAddress = ethers.utils.isAddress(identifier);
  if (isAddress) {
    ret.address = identifier;
  } else {
    ret.txHash = identifier;
  }
  return ret;
};

export const zeroX = (hash: string) => `0x${hash}`;

export const deZeroX = (zeroXHash: string) => zeroXHash.replace('0x', '');
