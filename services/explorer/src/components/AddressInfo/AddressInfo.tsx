import React from 'react';
import clsx from 'clsx';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { CopyTo, Icons } from '@taraxa_project/taraxa-ui';
import { zeroX } from '../../utils';
import useStyles from './AddressInfo.styles';
import { BlocksTable, TransactionsTable } from '../Tables';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { DataRow } from '../DataRow';
import { TransactionIcon } from '../icons';
import {
  AddressInfoDetails,
  BlockData,
  TableTabsProps,
  Transaction,
} from '../../models';
import { TableTabs } from '../TableTabs';

export interface AddressInfoProps {
  transactions: Transaction[];
  dagBlocks: BlockData[];
  pbftBlocks: BlockData[];
  details: AddressInfoDetails;
}

export const AddressInfo = ({
  details,
  transactions,
  dagBlocks,
  pbftBlocks,
}: AddressInfoProps) => {
  const classes = useStyles();
  const addressIcon = toSvg(details?.address, 40, { backColor: '#fff' });
  const onCopy = useCopyToClipboard();

  const pricePerTara =
    parseFloat(details?.balance) / parseFloat(details?.value);

  const tableTabs: TableTabsProps = {
    tabs: [
      {
        label: 'Transactions',
        index: 0,
        icon: (
          <Box className={classes.tabIconContainer}>
            <TransactionIcon />
          </Box>
        ),
        iconPosition: 'start',
        children: <TransactionsTable transactionsData={transactions} />,
      },
      {
        label: 'DAG Blocks',
        index: 1,
        icon: (
          <Box className={classes.tabIconContainer}>
            <Icons.Block />
          </Box>
        ),
        iconPosition: 'start',
        children: <BlocksTable blocksData={dagBlocks} type='dag' />,
      },
      {
        label: 'PBFT Blocks',
        index: 2,
        icon: (
          <Box className={classes.tabIconContainer}>
            <Icons.Block />
          </Box>
        ),
        iconPosition: 'start',
        children: <BlocksTable blocksData={pbftBlocks} type='pbft' />,
      },
    ],
    initialValue: 0,
  };

  return (
    <Paper elevation={1}>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='left'
        margin='2rem 2rem 2rem'
        gap='1.5rem'
      >
        <Box
          display='flex'
          flexDirection='row'
          alignItems='center'
          justifyContent='flex-start'
          gap='2rem'
          mt={3}
        >
          <div
            className={classes.iconContainer}
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{ __html: addressIcon }}
          />
          <Typography
            variant='h6'
            component='h6'
            style={{ fontWeight: 'bold', wordBreak: 'break-all' }}
          >
            {zeroX(details?.address)}
          </Typography>
          <CopyTo text={details?.address} onCopy={onCopy} />
        </Box>
        <Box className={classes.twoColumnFlex}>
          <Box
            display='flex'
            flexDirection='column'
            alignItems='left'
            gap='1.5rem'
          >
            <DataRow title='Balance' data={`${details?.balance} TARA`} />
            <DataRow
              title='Value'
              data={`$${details?.value} ( ${pricePerTara} / TARA )`}
            />
            <DataRow
              title='Transaction count'
              data={`${details?.transactionCount}`}
            />
          </Box>
          <div style={{ maxWidth: '320px' }}>
            <Grid container gap={1}>
              <Grid
                item
                xs={12}
                className={clsx(classes.gridHeader, classes.fullWidthHeader)}
              >
                BLOCKS PRODUCED:
              </Grid>
              <Grid className={classes.blocksBox} item>
                <div>{details?.dagBlocks}</div>
                <span>#DAG Blocks</span>
              </Grid>
              <Grid className={classes.blocksBox} item>
                <div>{details?.pbftBlocks}</div>
                <span>#PBFT Blocks</span>
              </Grid>
            </Grid>
          </div>
        </Box>
        <Divider light />
        <DataRow
          title='Total received'
          data={`${details?.totalReceived} TARA`}
        />
        <DataRow title='Total sent' data={`${details?.totalSent} TARA`} />
        <DataRow title='Fees' data={`${details?.fees} TARA`} />
        <Divider light />
        <Box
          display='flex'
          flexDirection='column'
          alignItems='flex-start'
          alignContent='center'
          style={{ overflowWrap: 'anywhere' }}
        >
          <TableTabs {...tableTabs} />
        </Box>
      </Box>
    </Paper>
  );
};
