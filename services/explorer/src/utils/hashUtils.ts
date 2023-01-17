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

  if (isAddress(identifier)) {
    ret.address = deZeroX(identifier);
  }

  if (isNumber(identifier)) {
    ret.blockNumber = +identifier;
  }

  if (isHash(identifier)) {
    ret.txHash = deZeroX(identifier);
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

export const isNumber = (element: string): boolean => {
  return !isNaN(Number(element)) && /^\d+$/.test(element);
};

export const isAddress = (element: string): boolean => {
  const address = zeroX(deZeroX(element));
  return ethers.utils.isAddress(address);
};

export const isHash = (element: string): boolean => {
  const hash = zeroX(deZeroX(element.toString().toLowerCase()));
  return (
    typeof hash === 'string' &&
    hash.length === 66 &&
    /^(0x)?[0-9a-f]*$/i.test(hash)
  );
};
