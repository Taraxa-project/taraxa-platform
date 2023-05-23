import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './components/theme';

export interface TaraxaThemeProviderProps {
  children: React.ReactNode;
}

const TaraxaThemeProvider = ({ children }: TaraxaThemeProviderProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default TaraxaThemeProvider;
