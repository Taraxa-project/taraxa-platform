import React, { useState } from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Menu as MMenu,
  MenuItem as MMenuItem,
} from '@mui/material';

import theme from '../theme';

import '../app.scss';

const Menu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MMenuItem onClick={handleClose}>Profile</MMenuItem>
        <MMenuItem onClick={handleClose}>My account</MMenuItem>
        <MMenuItem onClick={handleClose}>Logout</MMenuItem>
      </MMenu>
    </ThemeProvider>
  );
};

export default Menu;
