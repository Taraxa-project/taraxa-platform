import * as utils from 'web3-utils';

export const toChecksumAddress = (address: any) => {
  if (typeof address !== 'string') {
    address = address?.toString();
  }
  address = address?.trim();

  if (utils.isAddress(address)) {
    address = utils.toChecksumAddress(address);
  } else {
    console.error('Address is not valid.');
  }
  return address;
};
