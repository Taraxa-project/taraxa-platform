/* eslint-disable no-restricted-globals */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* eslint-disable no-console */
export type HeaderBtn = {
  label: string;
  onAction: () => void;
  selected: boolean;
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

export const useHeaderEffects = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (route: string) => {
    navigate(`/${route}`);
  };

  const headerButtons: HeaderBtn[] = [
    {
      label: 'Blocks',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('blocks'),
    },
    {
      label: 'Transactions',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('transactions'),
    },
    {
      label: 'Nodes',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('nodes'),
    },
    {
      label: 'Faucet',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('faucet'),
    },
  ];
  const [selected, setSelected] = useState<HeaderBtn>(
    headerButtons.find(
      (value) => value.label.toLowerCase() === location.pathname
    )
  );

  useEffect(() => {
    setSelected(
      headerButtons.find(
        (value) => `/${value.label.toLowerCase()}` === location.pathname
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return { headerButtons, selected };
};
