import { Box } from '@mui/material';
import React, { FC } from 'react';
import { Button, NetworkMenu, theme } from '@taraxa_project/taraxa-ui';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { HeaderBtn } from './Header.effects';

export interface DrawerElementsProps {
  toggleDrawer: (toggle: boolean) => void;
  headerButtons: HeaderBtn[];
}

export const DrawerElements: FC<DrawerElementsProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggleDrawer,
  headerButtons,
}) => {
  const { networks, currentNetwork, setCurrentNetwork } = useExplorerNetwork();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
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
                mr: 1,
                backgroundColor: button.selected
                  ? theme.palette.grey.A200
                  : 'none',
              }}
            />
          );
        })}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <NetworkMenu
          networks={networks}
          currentNetwork={currentNetwork}
          onNetworkChange={setCurrentNetwork}
        />
      </Box>
    </Box>
  );
};
