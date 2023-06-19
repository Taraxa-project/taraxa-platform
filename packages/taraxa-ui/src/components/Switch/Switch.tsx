import React from 'react';
import clsx from 'clsx';
import {
  Switch as MSwitch,
  SwitchProps as MSwitchProps,
  FormControlLabel,
} from '@mui/material';
import useStyles from './Switch.styles';

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
  );
};

export default Switch;
