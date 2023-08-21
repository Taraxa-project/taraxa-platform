import React from 'react';
import {
  ButtonGroup as MButtonGroup,
  ButtonGroupProps as MButtonGroupProps,
} from '@mui/material';

export interface ButtonGroupProps extends MButtonGroupProps {
  children: React.ReactNode;
}

const ButtonGroup = ({ children, ...props }: ButtonGroupProps) => {
  return <MButtonGroup {...props}>{children}</MButtonGroup>;
};

export default ButtonGroup;
