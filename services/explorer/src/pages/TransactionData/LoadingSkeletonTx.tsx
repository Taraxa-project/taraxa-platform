import React from 'react';
import { Divider, Paper, Skeleton, Stack } from '@taraxa_project/taraxa-ui';

export const DecodedLoadingSkeleton = (): JSX.Element => {
  return (
    <Stack spacing={3}>
      <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
      <Skeleton variant='rectangular' />
      <Skeleton variant='rectangular' />
      <Skeleton variant='rectangular' />
    </Stack>
  );
};

const LoadingSkeletonTx = (): JSX.Element => {
  return (
    <>
      <Paper elevation={1} style={{ padding: '2rem' }}>
        <Stack spacing={3}>
          <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
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
