import React from 'react';
import { Divider, Paper, Skeleton, Stack } from '@taraxa_project/taraxa-ui';

const PbftLoadingSkeleton = (): JSX.Element => {
  return (
    <>
      <Paper elevation={1} style={{ padding: '2rem' }}>
        <Stack spacing={4}>
          <Skeleton variant='circular' width={40} height={40} />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Divider light />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
          <Skeleton variant='rectangular' />
        </Stack>
      </Paper>
    </>
  );
};

export default PbftLoadingSkeleton;
