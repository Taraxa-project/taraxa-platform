import React from 'react';
import {
  Button as MButton,
  CssBaseline,
  ButtonProps as MButtonProps,
  ThemeProvider,
} from '@mui/material';
import theme from '../theme';

export interface ButtonProps extends MButtonProps {
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label?: string;
}

const Button = ({ label, Icon, ...props }: ButtonProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MButton {...props}>
        {Icon && <Icon style={{ marginRight: '0.5rem' }} />}
        {label && label}
      </MButton>
    </ThemeProvider>
  );
};

export default Button;
