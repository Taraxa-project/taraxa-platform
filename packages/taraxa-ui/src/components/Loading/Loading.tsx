import React from 'react';
import { CircularProgress } from '@mui/material';
import '../app.scss';

export interface LoadingProps {
  size?: number;
  color?: string;
}

const Loading = ({ size, color }: LoadingProps) => {
  return <CircularProgress size={size} style={{ color }} />;
};

export default Loading;
