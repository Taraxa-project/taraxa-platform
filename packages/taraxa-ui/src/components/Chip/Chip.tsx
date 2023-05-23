import React from 'react';
import { Chip as MChip, ChipProps as MChipProps } from '@mui/material';

export type ChipProps = MChipProps;

const Chip = ({
  clickable,
  color,
  avatar,
  deleteIcon,
  disabled,
  icon,
  label,
  size,
  onDelete,
  variant,
  onClick,
  className,
  style,
}: ChipProps) => {
  return (
    <MChip
      clickable={clickable}
      color={color}
      avatar={avatar}
      deleteIcon={deleteIcon}
      disabled={disabled}
      icon={icon}
      label={label}
      size={size}
      onDelete={onDelete}
      variant={variant}
      onClick={onClick}
      className={className}
      style={style}
    />
  );
};

export default Chip;
