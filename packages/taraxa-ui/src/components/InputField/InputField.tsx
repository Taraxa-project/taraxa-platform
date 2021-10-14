import React, { ChangeEventHandler } from 'react';
import { TextField, TextFieldProps, CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from '../theme';
import './inputfield.scss';

export type InputFieldProps = {
  label: string;
  id?: string;
  color?: 'primary' | 'secondary';
  defaultValue?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  margin?: 'dense' | 'none' | 'normal';
  multiline?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
  required?: boolean;
  placeholder?: string;
  size?: 'medium' | 'small';
  value?: any;
  variant?: 'filled' | 'outlined' | 'standard';
  className?: string;
  type?: string;
  min?: number;
  max?: number;
  error?: boolean;
  helperText?: string;
} & TextFieldProps;

const InputField = ({ max, min, ...props }: InputFieldProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TextField
        InputProps={
          max && min
            ? {
                inputProps: {
                  max: max,
                  min: min,
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
