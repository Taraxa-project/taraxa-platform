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

export const Header = () => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const { headerButtons, selected } = useHeaderEffects();
  const buttonRow = selected
    ? headerButtons.map((b) => {
        if (b.label !== selected.label) {
          b.selected = true;
        }
        return b;
      })
    : headerButtons;

  const buttons = (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      {buttonRow?.length &&
        buttonRow.map((button: HeaderBtn) => {
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
                  ? 'none'
                  : theme.palette.grey.A200,
              }}
            />
          );
        })}
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <NetworkMenu />
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
    >
      {isMobile ? hamburger : buttons}
    </THeader>
  );
};