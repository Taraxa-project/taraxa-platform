import React from 'react';
import {
  Paper as MPaper,
  PaperProps,
  Box as MBox,
  BoxProps,
  Grid as MGrid,
  GridProps,
  Container as MContainer,
  ContainerProps,
  Skeleton as MSkeleton,
  SkeletonProps,
  Stack as MStack,
  StackProps,
} from '@mui/material';

export const Paper = ({ children, ...props }: PaperProps) => {
  return <MPaper {...props}>{children}</MPaper>;
};

export const Box = ({ children, ...props }: BoxProps) => {
  return <MBox {...props}>{children}</MBox>;
};

export const Grid = ({ children, ...props }: GridProps) => {
  return <MGrid {...props}>{children}</MGrid>;
};

export const Container = ({ children, ...props }: ContainerProps) => {
  return <MContainer {...props}>{children}</MContainer>;
};

export const Skeleton = ({ children, ...props }: SkeletonProps) => {
  return <MSkeleton {...props}>{children}</MSkeleton>;
};

export const Stack = ({ children, ...props }: StackProps) => {
  return <MStack {...props}>{children}</MStack>;
};
