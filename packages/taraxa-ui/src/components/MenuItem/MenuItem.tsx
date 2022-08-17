import React from 'react';
import { CssBaseline, ThemeProvider, MenuItem as MMenuItem } from '@mui/material';

import theme from '../theme';

import '../app.scss';

const MenuItem = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MMenuItem onClick={onClick}>{label}</MMenuItem>
    </ThemeProvider>
  );
};

export default MenuItem;
