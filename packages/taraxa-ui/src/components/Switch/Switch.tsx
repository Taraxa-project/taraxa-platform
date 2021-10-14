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
}: SwitchProps) => {
  return (
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
        labelPlacement="start"
        color="white"
      />
    </ThemeProvider>
  );
};

export default Switch;
