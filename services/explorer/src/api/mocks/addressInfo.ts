import { AddressInfoDetails } from '../../models';

export const getMockedAddresInfoDetails = (): AddressInfoDetails => {
  const addressInfoProps: AddressInfoDetails = {
    address: '0xc6a808A6EC3103548f0b38d32DCb6a705B700ACDE',
    balance: '123',
    value: '123',
    transactionCount: 240,
    totalReceived: '2123',
    totalSent: '123',
    fees: '123',
    dagBlocks: 123,
    pbftBlocks: 123,
  };
  return addressInfoProps;
};
