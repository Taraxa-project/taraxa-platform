import React from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  Button,
  Header as THeader,
  NetworkMenu,
} from '@taraxa_project/taraxa-ui';
import { Box, Drawer, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { theme } from '../../theme-provider';
import { TaraxaIcon } from '../icons';
import { HeaderBtn, useHeaderEffects } from './Header.effects';
import { DrawerElements } from './DrawerElements';

export const Header = (): JSX.Element => {
  const isMobile = useMediaQuery({ query: `(max-width: 1200px)` });
  const {
    buttons: headerButtons,
    networks,
    currentNetwork,
    onInputChange,
    drawerState,
    toggleDrawer,
    isLoading,
    searchOptions,
    searchString,
    onLabelSelect,
    setNetwork,
    onClear,
    disableNetworkSelection,
  } = useHeaderEffects();

  const buttons = (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
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
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <NetworkMenu
          networks={networks}
          currentNetwork={currentNetwork}
          onNetworkChange={setNetwork}
          disableNetworkSelection={disableNetworkSelection}
        />
      </Box>
    </Box>
  );

  const hamburger = (
    <IconButton
      onClick={toggleDrawer(true)}
      color='primary'
      aria-label='upload picture'
      component='label'
    >
      <MenuIcon />
    </IconButton>
  );

  return (
    <THeader
      title='Taraxa Explorer'
      className='header'
      color='primary'
      position='relative'
      withSearch
      maxWidth='xl'
      Icon={TaraxaIcon}
      elevation={0}
      searchInputProps={{
        onInputChange,
        onChange: onLabelSelect,
        loading: isLoading,
        open: !!searchString,
        options: searchOptions,
        onClear,
        value: searchString,
      }}
    >
      {isMobile ? hamburger : buttons}
      <Drawer
        anchor='right'
        open={drawerState}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiPaper-root': {
            background: theme.palette.grey[800],
          },
        }}
      >
        <DrawerElements
          toggleDrawer={toggleDrawer}
          headerButtons={headerButtons}
        />
      </Drawer>
    </THeader>
  );
};
