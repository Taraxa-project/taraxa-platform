import React from 'react';
import { CssBaseline, ThemeProvider, CircularProgress } from '@mui/material';
import theme from '../theme';
import '../app.scss';

export interface LoadingProps {
  size?: number;
  color?: string;
}

const Loading = ({ size, color }: LoadingProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CircularProgress size={size} style={{ color }} />
    </ThemeProvider>
  );
};

export default Loading;
