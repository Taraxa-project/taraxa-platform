import '../src/components/app.scss';
import React from 'react';
import { ThemeProvider, CssBaseline } from '@material-ui/core/styles';
import theme from '../src/components/theme';

// export const decorators = [
//   Story => (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Story />
//     </ThemeProvider>
//   ),
// ];
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'centered',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
