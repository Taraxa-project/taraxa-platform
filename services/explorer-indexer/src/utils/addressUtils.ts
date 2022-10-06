export const zeroX = (address: string) => {
  return address ? (address.includes('0x') ? address : `0x${address}`) : null;
};

export const deZeroX = (ethAddress: string) => {
  return ethAddress
    ? ethAddress.includes('0x')
      ? ethAddress.replace('0x', '')
      : ethAddress
    : null;
};
