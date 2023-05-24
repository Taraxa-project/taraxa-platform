import React, { PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './components/theme';

const TaraxaThemeProvider = ({ children }: PropsWithChildren<any>) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default TaraxaThemeProvider;
