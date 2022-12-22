import { Theme } from '@mui/material';

declare module '@mui/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {
    // just so it isn't empty
    isEmpty: false;
  }
}
