import React, { FC } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { theme } from './theme';

interface Props {
  children: React.ReactNode;
}

export const ExplorerThemeProvider: FC<Props> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};
