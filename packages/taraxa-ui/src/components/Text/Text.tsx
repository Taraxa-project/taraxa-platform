import React from 'react';
import { CssBaseline, ThemeProvider, Typography, TypographyProps } from '@mui/material';
import theme from '../theme';

export interface TextProps extends TypographyProps {
  label?: string;
}

const Text = ({ label, children, ...props }: TextProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Typography {...props}>{label || children}</Typography>
    </ThemeProvider>
  );
};

export default Text;
