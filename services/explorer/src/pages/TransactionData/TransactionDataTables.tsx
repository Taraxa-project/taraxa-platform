import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Box, Divider, Icons } from '@taraxa_project/taraxa-ui';

import { BlockData, TableTabsProps, Transaction } from '../../models';
import { useGetInternalTransactionsByTxHash } from '../../api/explorer-api/fetchInternalTransactions';
import { displayWeiOrTara, getAddressTransactionType } from '../../utils';
import { useExplorerNetwork } from '../../hooks';
import useStyles from './TransactionData.styles';
import { TransactionIcon } from '../../components/icons';
import { BlocksTable, TransactionsTable } from '../../components/Tables';
import { TableTabs } from '../../components';

type TransactionDataTablesProps = {
  txHash: string;
};

const TransactionDataTables = ({
  txHash,
}: TransactionDataTablesProps): JSX.Element => {
  const classes = useStyles();

  const { backendEndpoint } = useExplorerNetwork();
  const [internalTransactions, setInternalTransactions] = useState<
    Transaction[]
  >([]);
  const [dagData] = useState<BlockData[]>();
  const [tabsStep, setTabsStep] = useState<number>(0);

  const [itxPage, setItxPage] = useState(0);
  const [itxRowsPerPage, setItxRowsPerPage] = useState(25);

  const [dagsRowsPerPage, setDagsRowsPerPage] = useState(25);
  const [dagsPage, setDagsPage] = useState(0);

  const { data: internalTxesData } = useGetInternalTransactionsByTxHash(
    backendEndpoint,
    txHash
  );

  useEffect(() => {
    if (internalTxesData?.data?.length > 0) {
      setInternalTransactions(
        internalTxesData.data?.map((tx: any) => ({
          hash: tx.hash,
          block: {
            number: tx.blockNumber,
            timestamp: tx.timestamp,
          },
          value: displayWeiOrTara(ethers.BigNumber.from(tx.value)),
          gasPrice: `${ethers.BigNumber.from(tx.gasPrice)} Wei`,
          gas: tx.gas?.toString(),
          status: tx.status ? 1 : 0,
          gasUsed: tx.gasUsed?.toString(),
          from: {
            address: tx.from,
          },
          to: {
            address: tx.to,
          },
          type: tx.type,
          action: getAddressTransactionType(tx.type),
        }))
      );
    }
  }, [internalTxesData]);

  const totalItxCount = internalTransactions.length;
  const totalDagCount = dagData?.length;

  const tableTabs: TableTabsProps = {
    tabs: [],
    initialValue: tabsStep,
  };

  if (!totalItxCount && !totalDagCount) return;

  if (totalItxCount > 0) {
    tableTabs.tabs.push({
      label: 'Internal Transactions',
      index: 0,
      icon: (
        <Box className={classes.tabIconContainer}>
          <TransactionIcon />
        </Box>
      ),
      iconPosition: 'start',
      children: (
        <TransactionsTable
          transactionsData={internalTransactions?.slice(
            itxPage * itxRowsPerPage,
            itxPage * itxRowsPerPage + itxRowsPerPage
          )}
          totalCount={+totalItxCount}
          pageNo={itxPage}
          rowsPage={itxRowsPerPage}
          changePage={(p: number) => setItxPage(p)}
          changeRows={(l: number) => {
            setItxRowsPerPage(l);
            setItxPage(0);
          }}
        />
      ),
    });
  }

  if (totalDagCount > 0) {
    tableTabs.tabs.push({
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
          blocksData={dagData?.slice(
            dagsPage * dagsRowsPerPage,
            dagsPage * dagsRowsPerPage + dagsRowsPerPage
          )}
          type='dag'
          totalCount={totalDagCount}
          pageNo={dagsPage}
          rowsPage={dagsRowsPerPage}
          changePage={(p: number) => setDagsPage(p)}
          changeRows={(l: number) => {
            setDagsRowsPerPage(l);
            setDagsPage(0);
          }}
        />
      ),
    });
  }

  return (
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
  );
};

export default TransactionDataTables;
