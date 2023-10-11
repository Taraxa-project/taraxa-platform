import React, { FC } from 'react';
import {
  Box,
  IconButton,
  Button,
  NetworkMenu,
  theme,
  MuiIcons,
} from '@taraxa_project/taraxa-ui';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { HeaderBtn } from './Header.effects';

export interface DrawerElementsProps {
  toggleDrawer: (
    toggle: boolean
  ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
  headerButtons: HeaderBtn[];
}

export const DrawerElements = ({
  toggleDrawer,
  headerButtons,
}: DrawerElementsProps) => {
  const { networks, currentNetwork, setNetwork } = useExplorerNetwork();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
      <Box
        p={2}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <IconButton
          onClick={toggleDrawer(false)}
          color='primary'
          aria-label='upload picture'
          component='label'
        >
          <MuiIcons.Close />
        </IconButton>
        <NetworkMenu
          networks={networks}
          currentNetwork={currentNetwork}
          onNetworkChange={setNetwork}
        />
      </Box>
      {headerButtons?.length &&
        headerButtons.map((button: HeaderBtn) => {
          return (
            <Button
              key={`${button.label}-${button.color}-${button.variant}`}
              label={button.label}
              color={button.color}
              variant={button.variant}
              onClick={button.onAction}
              sx={{
                backgroundColor: button.selected
                  ? theme.palette.grey.A200
                  : 'none',
              }}
            />
          );
        })}
    </Box>
  );
};
