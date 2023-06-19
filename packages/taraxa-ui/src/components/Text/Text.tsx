import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

export interface TextProps extends TypographyProps {
  label?: string;
}

const Text = ({ label, children, ...props }: TextProps) => {
  return <Typography {...props}>{label || children}</Typography>;
};

export default Text;
