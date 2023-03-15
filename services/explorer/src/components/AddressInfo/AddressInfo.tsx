import clsx from 'clsx';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { CopyTo, Icons, Loading } from '@taraxa_project/taraxa-ui';
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
  handlePbftChangePage: (p: number) => void;
  handlePbftChangeRowsPerPage: (l: number) => void;
  totalDagCount: number;
  rowsDagPerPage: number;
  dagPage: number;
  handleDagChangePage: (p: number) => void;
  handleDagChangeRowsPerPage: (l: number) => void;
  totalTxCount: number;
  rowsTxPerPage: number;
  txPage: number;
  handleTxChangePage: (p: number) => void;
  handleTxChangeRowsPerPage: (l: number) => void;
  tabsStep: number;
  setTabsStep: (step: number) => void;
  isFetchingAddressStats: boolean;
  isLoadingAddressStats: boolean;
  isLoadingTables: boolean;
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
  totalTxCount,
  rowsTxPerPage,
  txPage,
  handleTxChangePage,
  handleTxChangeRowsPerPage,
  tabsStep,
  setTabsStep,
  isFetchingAddressStats,
  isLoadingAddressStats,
  isLoadingTables,
}: AddressInfoProps): JSX.Element => {
  const classes = useStyles();
  const addressIcon = toSvg(details?.address, 40, { backColor: '#fff' });
  const onCopy = useCopyToClipboard();

  const tableTabs: TableTabsProps = {
    tabs: [],
    initialValue: tabsStep || 0,
  };

  if (totalTxCount > 0 && transactions?.length > 0) {
    tableTabs.tabs.push({
      label: 'Transactions',
      index: 0,
      icon: (
        <Box className={classes.tabIconContainer}>
          <TransactionIcon />
        </Box>
      ),
      iconPosition: 'start',
      children: (
        <TransactionsTable
          transactionsData={transactions}
          totalCount={+totalTxCount}
          pageNo={txPage}
          rowsPage={rowsTxPerPage}
          changePage={handleTxChangePage}
          changeRows={handleTxChangeRowsPerPage}
        />
      ),
    });
  }

  if (totalDagCount > 0 && dagBlocks?.length > 0) {
    tableTabs.tabs.push({
      label: 'DAG Blocks',
      index: (totalTxCount > 0 && transactions?.length) > 0 ? 1 : 0,
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
          totalCount={+totalDagCount}
          pageNo={dagPage}
          rowsPage={rowsDagPerPage}
          changePage={handleDagChangePage}
          changeRows={handleDagChangeRowsPerPage}
        />
      ),
    });
  }

  if (totalPbftCount > 0 && pbftBlocks?.length > 0) {
    tableTabs.tabs.push({
      label: 'PBFT Blocks',
      index:
        totalTxCount > 0 && transactions?.length > 0
          ? totalDagCount > 0
            ? 2
            : 1
          : 1,
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
          totalCount={+totalPbftCount}
          pageNo={pbftPage}
          rowsPage={rowsPbftPerPage}
          changePage={handlePbftChangePage}
          changeRows={handlePbftChangeRowsPerPage}
        />
      ),
    });
  }

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
              data={`${details?.balance ? details?.balance : '0'} TARA`}
            />
            <DataRow
              title='Value'
              data={`${details?.value ? details?.value : ''} ${
                details?.valueCurrency || ''
              } ( ${
                details?.pricePerTara ? details?.pricePerTara : ''
              } / TARA )`}
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
                {isFetchingAddressStats || isLoadingAddressStats ? (
                  <Loading />
                ) : (
                  <div>{details?.dagBlocks}</div>
                )}
                <span>#DAG Blocks</span>
              </Grid>
              <Grid className={classes.blocksBox} item>
                {isFetchingAddressStats || isLoadingAddressStats ? (
                  <Loading />
                ) : (
                  <div>{details?.pbftBlocks}</div>
                )}

                <span>#PBFT Blocks</span>
              </Grid>
            </Grid>
          </div>
        </Box>
        {isLoadingTables ? (
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            width='100%'
            my={6}
          >
            <Loading size={50} color='#6A7085' />
          </Box>
        ) : (
          (totalTxCount > 0 || totalDagCount > 0 || totalPbftCount > 0) && (
            <>
              <Divider light />
              <Box
                display='flex'
                flexDirection='column'
                alignItems='flex-start'
                alignContent='center'
                style={{ overflowWrap: 'anywhere' }}
              >
                <TableTabs {...tableTabs} setTabsStep={setTabsStep} />
              </Box>
            </>
          )
        )}
      </Box>
    </Paper>
  );
};
