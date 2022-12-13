import React, { FC } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { StylesProvider, createGenerateClassName } from '@mui/styles';

interface Props {
  children: React.ReactNode;
}

const generateClassName = createGenerateClassName({
  productionPrefix: 'explorer',
});

export const ExplorerThemeProvider: FC<Props> = ({ children }) => {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StylesProvider>
  );
};
