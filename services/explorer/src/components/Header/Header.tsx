/* eslint-disable no-console */
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  Button,
  Header as THeader,
  NetworkMenu,
} from '@taraxa_project/taraxa-ui';
import { Box } from '@mui/material';

import { HamburgerIcon, TaraxaIcon } from '../icons';
import { HeaderBtn, useHeaderEffects } from './Header.effects';

export const Header = () => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const { headerButtons } = useHeaderEffects();
  const buttons = (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      {headerButtons?.length &&
        headerButtons.map((button: HeaderBtn) => (
          <Button
            key={`${button.label}-${button.color}-${button.variant}`}
            label={button.label}
            color={button.color}
            variant={button.variant}
            onClick={button.onAction}
          />
        ))}
      <NetworkMenu horizontalPosition='right' />
    </Box>
  );

  const hamburger = (
    <div style={{ cursor: 'pointer' }} onClick={() => console.log('open!')}>
      <HamburgerIcon />
    </div>
  );

  return (
    <THeader
      title='Taraxa Community'
      className='header'
      color='primary'
      position='relative'
      withSearch
      Icon={TaraxaIcon}
      elevation={0}
    >
      {isMobile ? hamburger : buttons}
    </THeader>
  );
};
