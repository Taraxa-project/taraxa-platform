import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Divider, Paper } from '@mui/material';

const BlockCardSkeleton = (): JSX.Element => {
  return (
    <>
      <Paper elevation={1} style={{ padding: '1rem', width: '100%' }}>
        <Stack spacing={2}>
          <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
          <Divider light />
          <Stack spacing={4}>
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
            <Divider light />
            <Skeleton variant='rectangular' width='100%' height={60} />
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};

export default BlockCardSkeleton;
