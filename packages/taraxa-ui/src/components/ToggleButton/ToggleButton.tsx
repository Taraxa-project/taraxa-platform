import React from 'react';
import {
  ToggleButton as MToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from '@mui/material';
import useStyles from './ToggleButton.styles';

export interface ToggleButtonProps extends ToggleButtonGroupProps {
  currentValue: string;
  data: { value: string; label: string }[];
}

const ToggleButton = ({ currentValue, data, ...props }: ToggleButtonProps) => {
  const classes = useStyles();
  return (
    <ToggleButtonGroup value={currentValue} {...props}>
      {data.map((button) => (
        <MToggleButton
          key={button.value}
          className={
            button.value === currentValue ? classes.selected : classes.button
          }
          value={button.value}
        >
          {button.label}
        </MToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ToggleButton;
