import React from 'react';
import {
  Button as MButton,
  CssBaseline,
  ThemeProvider,
  ButtonProps as MButtonProps,
} from '@material-ui/core';
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
        {Icon && <Icon />}
        {label && label}
      </MButton>
    </ThemeProvider>
  );
};

export default Button;
