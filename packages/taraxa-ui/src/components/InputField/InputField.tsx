import React, { ChangeEventHandler } from 'react';
import {
  TextField,
  TextFieldProps,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import theme from '../theme';
import useStyles from './InputField.styles';

export type InputFieldProps = {
  label?: string;
  id?: string;
  color?: 'primary' | 'secondary';
  defaultValue?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  margin?: 'dense' | 'none' | 'normal';
  multiline?: boolean;
  onChange?:
    | ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined;
  required?: boolean;
  placeholder?: string;
  size?: 'medium' | 'small';
  value?: any;
  variant?: 'filled' | 'outlined' | 'standard';
  className?: string;
  type?: string;
  min?: string | number;
  max?: string | number;
  error?: boolean;
  helperText?: string;
} & TextFieldProps;

const InputField = ({ max, min, ...props }: InputFieldProps) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TextField
        classes={{
          root: classes.input,
        }}
        InputProps={
          max && min
            ? {
                inputProps: {
                  max,
                  min,
                },
              }
            : undefined
        }
        {...props}
      />
    </ThemeProvider>
  );
};

export default InputField;
