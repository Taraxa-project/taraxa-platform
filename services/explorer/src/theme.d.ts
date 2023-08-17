import { theme as TaraxaTheme } from '@taraxa_project/taraxa-ui';

declare module '@mui/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends TaraxaTheme {
    // just so it isn't empty
    isEmpty?: false;
  }
}
