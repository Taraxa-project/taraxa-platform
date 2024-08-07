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
  '0xa605dbb535847f803227cdbaec9cdfa34d4d4b77': 'MEXC',
  '0x39b1fC930C43606af5C353e90a55db10bCaF4087': 'Bridged ETH',
  '0xe126E0BaeAE904b8Cfd619Be1A8667A173b763a1': 'Taraxa Bridge',
  '0x7157233800c3c1f2ac8b12Cefe2cBE796C04446B': 'Ethereum Client',
  '0x97Eb8E024bE036eCdb25aDf842C5D6241189FB53': 'Beacon Light Client',
  '0xD014293ED981c7f557C0Cf55F7FbA025082Ed266': 'ETH Connector',
  '0x7C5E17A43c6cb223a86C5d63288273E0c1F1283F': 'TARA Connector',
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
