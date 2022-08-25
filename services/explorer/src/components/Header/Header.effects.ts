/* eslint-disable no-console */
export type HeaderBtn = {
  label: string;
  onAction: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
};

export enum Network {
  TESTNET = 'Californicum Testnet',
  MAINNET = 'Mainnet Candidate',
}

export const useHeaderEffects = () => {
  const headerButtons: HeaderBtn[] = [
    {
      label: 'Blocks',
      color: 'primary',
      variant: 'text',
      onAction: () => console.log('Blocks data'),
    },
    {
      label: 'Transactions',
      color: 'primary',
      variant: 'text',
      onAction: () => console.log('Transactions data'),
    },
    {
      label: 'Nodes',
      color: 'primary',
      variant: 'text',
      onAction: () => console.log('Nodes data'),
    },
    {
      label: 'Faucet',
      color: 'primary',
      variant: 'text',
      onAction: () => console.log('Faucet data'),
    },
  ];

  const networks = Object.values(Network);
  return { headerButtons, networks };
};
