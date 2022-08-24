import React from 'react';
import {
  Checkbox as MCheckbox,
  CssBaseline,
  CheckboxProps,
  ThemeProvider,
} from '@mui/material';
import theme from '../theme';

const Checkbox = ({ ...props }: CheckboxProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCheckbox color='secondary' {...props} />
    </ThemeProvider>
  );
};

export default Checkbox;
