import React from 'react';
import { MenuItem as MMenuItem, MenuItemProps } from '@mui/material';

import '../app.scss';

const MenuItem = ({ children, ...props }: MenuItemProps) => {
  return <MMenuItem {...props}>{children}</MMenuItem>;
};

export default MenuItem;
