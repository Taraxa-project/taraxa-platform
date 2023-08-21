import React from 'react';
import {
  ToggleButton as MToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from '@mui/material';

export interface BaseToggleButtonGroupProps extends ToggleButtonGroupProps {
  currentValue: string;
  data: { value: string; label: string }[];
}

const BaseToggleButtonGroup = ({
  currentValue,
  data,
  ...props
}: BaseToggleButtonGroupProps) => {
  return (
    <ToggleButtonGroup value={currentValue} {...props}>
      {data.map((button) => (
        <MToggleButton key={button.value} value={button.value}>
          {button.label}
        </MToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default BaseToggleButtonGroup;
