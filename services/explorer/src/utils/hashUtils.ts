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
  const isAddress = ethers.utils.isAddress(identifier);
  if (isAddress) {
    ret.address = identifier;
  }
  // eslint-disable-next-line no-restricted-globals
  const isNotANumber = isNaN(+identifier);
  if (!isNotANumber && !isAddress) ret.blockNumber = +identifier;
  if (isNotANumber && !isAddress && identifier.length === 64) {
    ret.txHash = identifier;
  }
  return ret;
};

export const zeroX = (hash: string): string => {
  return hash ? (hash.includes('0x') ? hash : `0x${hash}`) : null;
};

export const deZeroX = (zeroXHash: string): string => {
  if (!zeroXHash) {
    return null;
  }
  return zeroXHash.replace('0x', '');
};
