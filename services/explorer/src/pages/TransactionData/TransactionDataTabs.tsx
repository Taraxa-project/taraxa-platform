import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Box, Divider } from '@taraxa_project/taraxa-ui';

import { TableTabsProps, Transaction } from '../../models';
import { useGetInternalTransactionsByTxHash } from '../../api';
import { displayWeiOrTara, getAddressTransactionType } from '../../utils';
import { useExplorerNetwork } from '../../hooks';
import useStyles from './TransactionData.styles';
import { TransactionIcon } from '../../components/icons';
import { TransactionsTable } from '../../components/Tables';
import { TableTabs } from '../../components';

type TransactionDataTabsProps = {
  txHash: string;
};

const TransactionDataTabs = ({
  txHash,
}: TransactionDataTabsProps): JSX.Element => {
  const classes = useStyles();

  const { backendEndpoint } = useExplorerNetwork();
  const [internalTransactions, setInternalTransactions] = useState<
    Transaction[]
  >([]);
  const [tabsStep, setTabsStep] = useState<number>(0);

  const [itxPage, setItxPage] = useState(0);
  const [itxRowsPerPage, setItxRowsPerPage] = useState(25);

  const { data: internalTxesData } = useGetInternalTransactionsByTxHash(
    backendEndpoint,
    txHash
  );

  useEffect(() => {
    if (internalTxesData?.data?.data?.length > 0) {
      setInternalTransactions(
        internalTxesData.data.data.map((tx: any) => ({
          hash: tx.hash,
          block: {
            number: tx.blockNumber,
            timestamp: tx.timestamp,
          },
          value: displayWeiOrTara(ethers.BigNumber.from(tx.value)),
          gasPrice: `${ethers.BigNumber.from(tx.gasPrice)} Wei`,
          gas: tx.gas?.toString() || '0',
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

  const tableTabs: TableTabsProps = {
    tabs: [],
    initialValue: tabsStep,
  };

  if (!totalItxCount) return;

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

export default TransactionDataTabs;
