import React from 'react';
import { CssBaseline, ThemeProvider, CircularProgress } from '@material-ui/core';
import theme from '../theme';
import '../app.scss';

const Loading = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CircularProgress />
    </ThemeProvider>
  );
};

export default Loading;
