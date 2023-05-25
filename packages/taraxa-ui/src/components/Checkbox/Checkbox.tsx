import React from 'react';
import { Checkbox as MCheckbox, CheckboxProps } from '@mui/material';

const Checkbox = ({ ...props }: CheckboxProps) => {
  return <MCheckbox color='secondary' {...props} />;
};

export default Checkbox;
