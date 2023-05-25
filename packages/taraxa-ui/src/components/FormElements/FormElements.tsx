import React from 'react';
import {
  FormControl as MFormControl,
  FormControlProps,
  FormHelperText as MFormHelperText,
  FormHelperTextProps,
  Select as MSelect,
  SelectProps,
} from '@mui/material';

export const FormControl = ({ children, ...props }: FormControlProps) => {
  return <MFormControl {...props}>{children}</MFormControl>;
};

export const FormHelperText = ({ children, ...props }: FormHelperTextProps) => {
  return <MFormHelperText {...props}>{children}</MFormHelperText>;
};

export const Select = ({ children, ...props }: SelectProps) => {
  return <MSelect {...props}>{children}</MSelect>;
};
