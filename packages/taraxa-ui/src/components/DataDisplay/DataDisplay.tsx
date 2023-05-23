import React from 'react';
import {
  Divider as MDivider,
  DividerProps,
  Typography as MTypography,
  TypographyProps as MTypographyProps,
  CircularProgress as MCircularProgress,
  CircularProgressProps,
  IconButton as MIconButton,
  IconButtonProps as MIconButtonProps,
  Card as MCard,
  CardProps,
  CardContent as MCardContent,
  CardContentProps,
  Drawer as MDrawer,
  DrawerProps,
  Tabs as MTabs,
  TabsProps,
  Tab as MTab,
  TabProps,
  Tooltip as MTooltip,
  TooltipProps,
} from '@mui/material';

export type TypographyProps = MTypographyProps & {
  component?: React.ElementType;
};

export type IconButtonProps = MIconButtonProps & {
  component?: React.ElementType;
};

export const Divider = ({ children, ...props }: DividerProps) => {
  return <MDivider {...props}>{children}</MDivider>;
};

export const Typography = ({ children, ...props }: TypographyProps) => {
  return <MTypography {...props}>{children}</MTypography>;
};

export const CircularProgress = ({ ...props }: CircularProgressProps) => {
  return <MCircularProgress {...props} />;
};

export const IconButton = ({ children, ...props }: IconButtonProps) => {
  return <MIconButton {...props}>{children}</MIconButton>;
};

export const MuiCard = ({ children, ...props }: CardProps) => {
  return <MCard {...props}>{children}</MCard>;
};

export const CardContent = ({ children, ...props }: CardContentProps) => {
  return <MCardContent {...props}>{children}</MCardContent>;
};

export const Drawer = ({ children, ...props }: DrawerProps) => {
  return <MDrawer {...props}>{children}</MDrawer>;
};

export const Tabs = ({ children, ...props }: TabsProps) => {
  return <MTabs {...props}>{children}</MTabs>;
};

export const Tab = ({ children, ...props }: TabProps) => {
  return <MTab {...props}>{children}</MTab>;
};

export const MuiTooltip = ({ children, ...props }: TooltipProps) => {
  return (
    <MTooltip {...props} enterTouchDelay={100}>
      {children}
    </MTooltip>
  );
};
