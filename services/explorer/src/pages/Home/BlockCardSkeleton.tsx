import React from 'react';
import {
  MuiCard as Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
} from '@taraxa_project/taraxa-ui';
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
