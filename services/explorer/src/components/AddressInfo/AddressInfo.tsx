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
import { TableTabs } from '../TableTabs';
import {
  Transaction,
  BlockData,
  AddressInfoDetails,
  TableTabsProps,
} from '../../models';

export interface AddressInfoProps {
  transactions: Transaction[];
  dagBlocks: BlockData[];
  pbftBlocks: BlockData[];
  details: AddressInfoDetails;
  totalPbftCount: number;
  rowsPbftPerPage: number;
  pbftPage: number;
  handlePbftChangePage: (newPage: number) => void;
  handlePbftChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  totalDagCount: number;
  rowsDagPerPage: number;
  dagPage: number;
  handleDagChangePage: (newPage: number) => void;
  handleDagChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export const AddressInfo = ({
  details,
  transactions,
  dagBlocks,
  pbftBlocks,
  totalPbftCount,
  rowsPbftPerPage,
  pbftPage,
  handlePbftChangePage,
  handlePbftChangeRowsPerPage,
  totalDagCount,
  rowsDagPerPage,
  dagPage,
  handleDagChangePage,
  handleDagChangeRowsPerPage,
}: AddressInfoProps): JSX.Element => {
  const classes = useStyles();
  const addressIcon = toSvg(details?.address, 40, { backColor: '#fff' });
  const onCopy = useCopyToClipboard();

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
        children: (
          <BlocksTable
            blocksData={dagBlocks}
            type='dag'
            totalCount={totalDagCount}
            pageNo={dagPage}
            rowsPage={rowsDagPerPage}
            changePage={handleDagChangePage}
            changeRows={handleDagChangeRowsPerPage}
          />
        ),
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
        children: (
          <BlocksTable
            blocksData={pbftBlocks}
            type='pbft'
            totalCount={totalPbftCount}
            pageNo={pbftPage}
            rowsPage={rowsPbftPerPage}
            changePage={handlePbftChangePage}
            changeRows={handlePbftChangeRowsPerPage}
          />
        ),
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
          <CopyTo text={zeroX(details?.address)} onCopy={onCopy} />
        </Box>
        <Box className={classes.twoColumnFlex}>
          <Box
            display='flex'
            flexDirection='column'
            alignItems='left'
            gap='1.5rem'
          >
            <DataRow
              title='Balance'
              data={`${
                details?.balance
                  ? Number(details?.balance)?.toLocaleString()
                  : ''
              } TARA`}
            />
            <DataRow
              title='Value'
              data={`$${
                details?.value ? Number(details?.value).toLocaleString() : ''
              } ${details?.valueCurrency || ''} ( ${
                details?.pricePerTara ? Number(details?.pricePerTara) : ''
              } / TARA )`}
            />
            <DataRow
              title='Transaction count'
              data={`${details?.transactionCount || ''}`}
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
          data={`${
            details?.totalReceived
              ? Number(details?.totalReceived).toLocaleString()
              : ''
          } TARA`}
        />
        <DataRow
          title='Total sent'
          data={`${
            details?.totalSent
              ? Number(details?.totalSent).toLocaleString()
              : ''
          } TARA`}
        />
        <DataRow
          title='Fees'
          data={`${
            details?.fees ? Number(details?.fees).toLocaleString() : ''
          } TARA`}
        />
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
