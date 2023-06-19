import React, { FC } from 'react';
import { StylesProvider, createGenerateClassName } from '@mui/styles';
import { TaraxaThemeProvider } from '@taraxa_project/taraxa-ui';

interface Props {
  children: React.ReactNode;
}

const generateClassName = createGenerateClassName({
  productionPrefix: 'explorer',
});

export const ExplorerThemeProvider: FC<Props> = ({ children }) => {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <TaraxaThemeProvider>{children}</TaraxaThemeProvider>
    </StylesProvider>
  );
};
