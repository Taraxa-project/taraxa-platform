import React from 'react';
import { Radio as MRadio, RadioProps as MRadioProps } from '@mui/material';

export type RadioProps = MRadioProps;

const Radio = ({
  checked,
  name,
  color,
  disabled,
  onChange,
  id,
  className,
  value,
}: RadioProps) => {
  return (
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
  );
};

export default Radio;
