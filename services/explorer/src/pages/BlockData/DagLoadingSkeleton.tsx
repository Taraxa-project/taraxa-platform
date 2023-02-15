import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Divider, Paper } from '@mui/material';

const DagLoadingSkeleton = (): JSX.Element => {
  return (
    <>
      <Paper elevation={1} style={{ padding: '2rem' }}>
        <Stack spacing={4}>
          <Skeleton variant='circular' width={40} height={40} />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Divider light />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
        </Stack>
      </Paper>
    </>
  );
};

export default DagLoadingSkeleton;
