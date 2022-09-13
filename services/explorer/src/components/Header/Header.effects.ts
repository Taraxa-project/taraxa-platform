/* eslint-disable no-restricted-globals */
import { SearchInputProps } from '@taraxa_project/taraxa-ui/src/components/SearchInput/SearchInput';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';

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
  const { networks, currentNetwork, setCurrentNetwork } = useExplorerNetwork();
  const [drawerState, setDrawerState] = useState<boolean>(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setDrawerState(open);
    };

  const onClick = (route: string) => {
    navigate(`/${route}`);
    setDrawerState(false);
  };

  const headerButtons: HeaderBtn[] = [
    {
      label: 'DAG',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('dag'),
    },
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
  const [buttons, setButtons] = useState<HeaderBtn[]>(headerButtons);

  const onInputChange = (searchString: string) => {
    console.log('Searching for: ', searchString);
  };

  useEffect(() => {
    setButtons(
      headerButtons.map((btn) => {
        if (`/${btn.label.toLowerCase()}` === location.pathname)
          btn.selected = true;
        return btn;
      })
    );
  }, [location]);

  const searchInputProps: SearchInputProps = {
    onInputChange,
  };

  return {
    headerButtons,
    buttons,
    networks,
    currentNetwork,
    setCurrentNetwork,
    searchInputProps,
    drawerState,
    toggleDrawer,
  };
};
