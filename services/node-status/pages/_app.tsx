import '../styles/app.scss';
import React from 'react';
import type { AppProps } from 'next/app';
import { TaraxaThemeProvider } from '@taraxa_project/taraxa-ui';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TaraxaThemeProvider>
      <Component {...pageProps} />
    </TaraxaThemeProvider>
  );
}
