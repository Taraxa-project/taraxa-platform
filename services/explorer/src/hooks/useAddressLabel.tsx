import { useMemo } from 'react';

type AddressLabels = {
  [key: string]: string;
};

const ADDRESS_LABELS: AddressLabels = {
  '0x723304d1357a2334fcf902aa3d232f5139080a1b':
    'Ecosystem Fund + Locked Team Tokens',
  '0x00000000000000000000000000000000000000fe': 'Taraxa Staking Contract',
  '0xf3b803a8f4c4fc3fbe454b6438dc0ed22735f01b': 'Taraxa Claim Contract',
  '0x111f91441efc8c6c0edf6534970cc887e2fabaa8': 'Taraxa Faucet',
  '0x10f4fd4d9856efd5700f0cb70b90bf519a3cd238':
    'Foundation (never to be circulated)',
  '0xd6216fc19db775df9774a6e33526131da7d19a2c': 'Kucoin 6',
  '0x0d0707963952f2fba59dd06f2b425ace40b492fe': 'Gate.io',
};

export const useAddressLabel = () => {
  const labels = useMemo<AddressLabels>(() => ADDRESS_LABELS, []);

  const findLabelFor = (a: string) => {
    a = a.toLowerCase();
    if (labels[a]) {
      return labels[a];
    }
    return null;
  };

  return {
    labels,
    findLabelFor,
  };
};
