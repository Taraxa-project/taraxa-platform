import { Theme } from '@mui/material';

declare module '@mui/styles' {
  interface DefaultTheme extends Theme {
    // just so it isn't empty
    isEmpty: false;
  }
}
