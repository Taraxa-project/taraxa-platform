import { Box, Divider, Icons } from '@taraxa_project/taraxa-ui';
import useStyles from './AddressDetails.styles';
import { BlocksTable, TransactionsTable } from '../Tables';
import { TransactionIcon } from '../icons';
import { TableTabs } from '../TableTabs';
import { TableTabsProps } from '../../models';
import { BlockTablePagination, TxTablePaginate } from '../../api';

export interface AddressTablesProps {
  pbftTablePagination: BlockTablePagination;
  dagTablePagination: BlockTablePagination;
  txTablePagination: TxTablePaginate;
  tabsStep: number;
  setTabsStep: (step: number) => void;
}

export const AddressTables = ({
  pbftTablePagination,
  dagTablePagination,
  txTablePagination,
  tabsStep,
  setTabsStep,
}: AddressTablesProps): JSX.Element => {
  const classes = useStyles();

  const {
    data: pbftBlocks,
    total: totalPbftCount,
    page: pbftPage,
    rowsPerPage: rowsPbftPerPage,
    handleChangePage: handlePbftChangePage,
    handleChangeRowsPerPage: handlePbftChangeRowsPerPage,
  } = pbftTablePagination;

  const {
    data: dagBlocks,
    total: totalDagCount,
    page: dagPage,
    rowsPerPage: rowsDagPerPage,
    handleChangePage: handleDagChangePage,
    handleChangeRowsPerPage: handleDagChangeRowsPerPage,
  } = dagTablePagination;

  const {
    data: transactions,
    total: totalTxCount,
    page: txPage,
    rowsPerPage: rowsTxPerPage,
    handleChangePage: handleTxChangePage,
    handleChangeRowsPerPage: handleTxChangeRowsPerPage,
  } = txTablePagination;

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
  );
};
