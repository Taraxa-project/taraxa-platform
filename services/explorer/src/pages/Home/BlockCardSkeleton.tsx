import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Card, CardContent, Divider } from '@mui/material';
import useStyles from './BlockCardSkeleton.styles';

const BlockCardSkeleton = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Card className={classes.card} variant='outlined'>
      <Stack spacing={2}>
        <Skeleton className={classes.cardHeader} variant='text' width={100} />
        <Divider light />
        <CardContent className={classes.cardContent}>
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
        </CardContent>
      </Stack>
    </Card>
  );
};

export default BlockCardSkeleton;
