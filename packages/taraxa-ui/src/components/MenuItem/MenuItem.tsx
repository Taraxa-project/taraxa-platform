import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
  MenuItem as MMenuItem,
  MenuItemProps,
} from '@mui/material';

import theme from '../theme';

import '../app.scss';

const MenuItem = ({ children, ...props }: MenuItemProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MMenuItem {...props}>{children}</MMenuItem>
    </ThemeProvider>
  );
};

export default MenuItem;
