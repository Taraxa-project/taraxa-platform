import React from 'react';
import {
  Radio as MRadio,
  RadioProps as MRadioProps,
  CssBaseline,
  ThemeProvider,
} from '@material-ui/core';
import theme from '../theme';

export interface RadioProps extends MRadioProps {}

const Radio = ({ checked, name, color, disabled, onChange, id, className, value }: RadioProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MRadio
        checked={checked}
        onChange={onChange}
        name={name}
        id={id}
        className={className}
        disabled={disabled}
        color={color}
        value={value}
      />
    </ThemeProvider>
  );
};

export default Radio;
