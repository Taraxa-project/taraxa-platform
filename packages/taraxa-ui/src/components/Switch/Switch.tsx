import React from 'react';
import {
  Switch as MSwitch,
  CssBaseline,
  ThemeProvider,
  SwitchProps as MSwitchProps,
  FormControlLabel,
} from '@material-ui/core';
import theme from '../theme';

export interface SwitchProps extends MSwitchProps {
  label: string;
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
}

const Switch = ({
  checked,
  name,
  label,
  color,
  disabled,
  onChange,
  id,
  className,
  value,
  labelPlacement,
}: SwitchProps) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <FormControlLabel
      value={value}
      id={id}
      className={className}
      control={
        <MSwitch
          checked={checked}
          onChange={onChange}
          name={name}
          disabled={disabled}
          color={color}
          value={value}
        />
      }
      label={label}
      labelPlacement={labelPlacement || 'start'}
      color="white"
    />
  </ThemeProvider>
);

export default Switch;
