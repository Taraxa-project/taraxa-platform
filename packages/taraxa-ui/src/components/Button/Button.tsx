import React from 'react';
import {
  Button as MButton,
  ButtonProps as MButtonProps,
  Typography,
} from '@mui/material';

export interface ButtonProps extends MButtonProps {
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label?: string;
}

const Button = ({ label, Icon, ...props }: ButtonProps) => {
  return (
    <MButton {...props}>
      {Icon && <Icon />}
      {label && <Typography>{label}</Typography>}
    </MButton>
  );
};

export default Button;
