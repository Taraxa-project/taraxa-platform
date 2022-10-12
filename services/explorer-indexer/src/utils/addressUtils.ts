export const zeroX = (address: string) => {
  return address
    ? address.includes('0x')
      ? address.toLowerCase()
      : `0x${address.toLowerCase()}`
    : null;
};

export const deZeroX = (ethAddress: string) => {
  return ethAddress
    ? ethAddress.includes('0x')
      ? ethAddress.replace('0x', '').toLowerCase()
      : ethAddress.toLowerCase()
    : null;
};
