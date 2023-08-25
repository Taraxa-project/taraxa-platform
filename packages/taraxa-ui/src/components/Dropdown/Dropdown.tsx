import React from 'react';
import { Menu, MenuProps as MMenuProps, MenuItem, Button } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export interface MenuProps extends MMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  currentValue: { value: string; label: string };
  handleClose: (value: string) => void;
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  menuItems: { value: string; label: string }[];
  buttonColor?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
  buttonSize?: 'small' | 'medium' | 'large';
  buttonStyle?: React.CSSProperties;
}

const Dropdown = ({
  anchorEl,
  open,
  currentValue,
  menuItems,
  handleClose,
  handleClick,
  buttonColor = 'info',
  buttonSize = 'small',
  buttonStyle,
  ...props
}: MenuProps) => {
  return (
    <>
      <Button
        id='basic-button'
        variant='outlined'
        size={buttonSize}
        color={buttonColor}
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        style={buttonStyle}
      >
        {currentValue.label}
      </Button>
      <Menu
        {...props}
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose(currentValue.value)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={`${item.value}-${item.label}`}
            onClick={() => handleClose(item.value)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Dropdown;
