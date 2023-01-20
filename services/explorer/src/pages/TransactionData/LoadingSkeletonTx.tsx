import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Divider, Paper } from '@mui/material';

const LoadingSkeletonTx = (): JSX.Element => {
  return (
    <>
      <Paper elevation={1} style={{ padding: '2rem' }}>
        <Stack spacing={3}>
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Divider light />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
        </Stack>
      </Paper>
    </>
  );
};

export default LoadingSkeletonTx;
