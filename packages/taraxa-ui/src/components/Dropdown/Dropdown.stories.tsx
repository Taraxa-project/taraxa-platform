import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import Dropdown, { MenuProps } from './Dropdown';

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
} as Meta;

const Template: Story<MenuProps> = (args) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState<string | null>(null);
  const open = Boolean(anchorEl);
  const menuItems = [
    { value: 'hex', label: 'Hexadecimal' },
    { value: 'dec', label: 'Decimal' },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (val: string) => {
    setValue(val);
    setAnchorEl(null);
  };

  const currentValue =
    menuItems.find((item) => item.value === value) || menuItems[0];

  return (
    <Dropdown
      {...args}
      anchorEl={anchorEl}
      open={open}
      currentValue={currentValue}
      menuItems={menuItems}
      handleClick={handleClick}
      handleClose={handleClose}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  buttonColor: 'info',
};
