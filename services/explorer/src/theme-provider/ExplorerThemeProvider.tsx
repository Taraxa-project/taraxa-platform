import React, { FC } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { theme } from './theme';

const cache = createCache({
  key: 'css',
  prepend: true,
});
interface Props {
  children: React.ReactNode;
}

export const ExplorerThemeProvider: FC<Props> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
};
