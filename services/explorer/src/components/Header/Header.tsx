/* eslint-disable no-console */
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  Button,
  Header as THeader,
  NetworkMenu,
} from '@taraxa_project/taraxa-ui';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { theme } from '../../theme-provider';
import { TaraxaIcon } from '../icons';
import { HeaderBtn, useHeaderEffects } from './Header.effects';

export const Header = (): JSX.Element => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const {
    buttons: headerButtons,
    networks,
    currentNetwork,
    setCurrentNetwork,
    searchInputProps,
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
          onNetworkChange={setCurrentNetwork}
        />
      </Box>
    </Box>
  );

  const hamburger = (
    <IconButton
      onClick={() => console.log('open!')}
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
      searchInputProps={searchInputProps}
    >
      {isMobile ? hamburger : buttons}
    </THeader>
  );
};
