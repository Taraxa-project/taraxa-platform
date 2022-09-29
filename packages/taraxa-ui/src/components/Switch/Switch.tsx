import React from 'react';
import clsx from 'clsx';
import {
  Switch as MSwitch,
  CssBaseline,
  ThemeProvider,
  SwitchProps as MSwitchProps,
  FormControlLabel,
} from '@mui/material';
import useStyles from './Switch.styles';
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
}: SwitchProps) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FormControlLabel
        value={value}
        id={id}
        className={clsx(classes.root, className)}
        control={
          <MSwitch
            checked={checked}
            onChange={onChange}
            name={name}
            disabled={disabled}
            color={color || 'secondary'}
            value={value}
          />
        }
        label={label}
        labelPlacement={labelPlacement || 'start'}
        color='white'
      />
    </ThemeProvider>
  );
};

export default Switch;
