import React from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  Box,
  Drawer,
  IconButton,
  Button,
  Header as THeader,
  NetworkMenu,
  SearchInput,
  MuiIcons,
  theme,
} from '@taraxa_project/taraxa-ui';
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
  } = useHeaderEffects();

  const buttons = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
      }}
    >
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
        />
      </Box>
    </Box>
  );

  const hamburger = (
    <IconButton
      onClick={toggleDrawer(true)}
      color='primary'
      aria-label='upload picture'
      // component='label'
    >
      <MuiIcons.Menu />
    </IconButton>
  );

  return (
    <THeader
      title='Taraxa Explorer'
      className='header'
      color='primary'
      position='relative'
      maxWidth='xl'
      Icon={TaraxaIcon}
      elevation={0}
    >
      <SearchInput
        placeholder={'Hash or number...'}
        open={!!searchString}
        fullWidth
        onInputChange={onInputChange}
        onChange={onLabelSelect}
        loading={isLoading}
        options={searchOptions}
        onClear={onClear}
        searchString={searchString}
      />
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
