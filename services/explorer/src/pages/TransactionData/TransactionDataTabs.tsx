import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Box, Divider, Typography, Icons } from '@taraxa_project/taraxa-ui';

import { CallData, TableTabsProps, Transaction } from '../../models';
import {
  EventData,
  useGetDecodedLogsByTxHash,
  useGetDecodedTransactionsByTxHash,
  useGetInternalTransactionsByTxHash,
} from '../../api';
import { displayWeiOrTara, getAddressTransactionType } from '../../utils';
import { useExplorerNetwork } from '../../hooks';
import useStyles from './TransactionData.styles';
import { TransactionsTable } from '../../components/Tables';
import { DataRow, TableTabs } from '../../components';
import { EventDataDisplay } from './EventDataDisplay';
import { TopicDataDisplay } from './TopicDataDisplay';

type TransactionDataTabsProps = {
  txHash: string;
  hasLogs: boolean;
};

const TransactionDataTabs = ({
  txHash,
  hasLogs,
}: TransactionDataTabsProps): JSX.Element => {
  const classes = useStyles();

  const { backendEndpoint } = useExplorerNetwork();
  const [tabsStep, setTabsStep] = useState<number>(0);

  const [itxPage, setItxPage] = useState(0);
  const [itxRowsPerPage, setItxRowsPerPage] = useState(25);

  const { data: internalTxesData } = useGetInternalTransactionsByTxHash(
    backendEndpoint,
    txHash
  );
  const { data: decodedTxData } = useGetDecodedTransactionsByTxHash(
    backendEndpoint,
    txHash
  );
  const { data: decodedLogData } = useGetDecodedLogsByTxHash(
    backendEndpoint,
    hasLogs,
    txHash
  );

  const internalTransactions: Transaction[] =
    internalTxesData?.data?.data?.length > 0
      ? internalTxesData.data.data.map((tx: any) => ({
          hash: tx.hash,
          block: {
            number: tx.blockNumber,
            timestamp: tx.timestamp,
          },
          value: displayWeiOrTara(ethers.BigNumber.from(tx.value)),
          gasCost: tx.gasCost,
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
      : [];
  const totalItxCount = internalTransactions.length;
  const callData = decodedTxData?.data?.calldata as CallData;
  const dataLogs = decodedLogData?.data?.data as EventData[];

  const tableTabs: TableTabsProps = {
    tabs: [],
    initialValue: tabsStep,
  };

  if (!totalItxCount && !callData && !dataLogs) return;

  if (totalItxCount > 0) {
    tableTabs.tabs.push({
      label: 'Internal Transactions',
      index: 0,
      icon: (
        <Box className={classes.tabIconContainer}>
          <Icons.Route />
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

  if (callData && callData.name) {
    tableTabs.tabs.push({
      label: 'Function Data',
      index: tableTabs.tabs.length,
      icon: (
        <Box className={classes.tabIconContainer}>
          <Icons.Tips />
        </Box>
      ),
      iconPosition: 'start',
      children: (
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='flex-start'
          gap='1rem'
          mt={2}
        >
          <>
            <Typography variant='h6' component='h6' color='primary'>
              Transaction data
            </Typography>
            {callData && callData.name && (
              <DataRow title='Function name' data={`${callData.name}`} />
            )}
            {callData &&
              callData.params &&
              callData.params.map((param, i) => (
                <DataRow
                  key={param + '-' + i}
                  title={`[${i}]`}
                  data={`${
                    Array.isArray(param) ? param.join(', ') : param || 'Not Set'
                  }`}
                />
              ))}
          </>
        </Box>
      ),
    });
  }

  if (dataLogs?.length > 0) {
    tableTabs.tabs.push({
      label: 'Event Logs',
      index: tableTabs.tabs.length,
      icon: (
        <Box className={classes.tabIconContainer}>
          <Icons.File />
        </Box>
      ),
      iconPosition: 'start',
      children: (
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='flex-start'
          gap='1rem'
          mt={2}
        >
          <>
            <Typography variant='h6' component='h6' color='primary'>
              Event Data
            </Typography>
            {dataLogs &&
              dataLogs.length > 0 &&
              dataLogs.map((logData, i) => (
                <div key={`${logData.name}-${i}`}>
                  {logData && logData.address && (
                    <DataRow
                      key={`${logData.address}`}
                      title='Address'
                      data={`${logData.address}`}
                    />
                  )}
                  {logData && logData.name && (
                    <DataRow
                      key={`${logData.name}`}
                      title='Name'
                      data={`${logData.name}`}
                    />
                  )}
                  {logData && logData.topics && (
                    <>
                      <DataRow
                        key={`${logData.topics.length}`}
                        title='Topics'
                        data='&nbsp;'
                      />
                      {logData.topics.map((t, i) => {
                        if (i === 1 || i === 2) {
                          return (
                            <TopicDataDisplay
                              key={`${t}`}
                              title={`[${i}]`}
                              hexValue={`-> ${t}`}
                            />
                          );
                        }
                        return (
                          <DataRow
                            key={`${t}`}
                            title={`[${i}]`}
                            data={`-> ${t}`}
                          />
                        );
                      })}
                    </>
                  )}
                  {logData && logData.params && logData.params.length > 0 && (
                    <>
                      <DataRow
                        key={`${logData.params.length}`}
                        title='Decoded Topics'
                        data='&nbsp;'
                      />
                      {logData.params.map((p, i) => (
                        <DataRow
                          key={`${p}`}
                          title={`[${i}]`}
                          data={`-> ${p}`}
                        />
                      ))}
                    </>
                  )}
                  {logData && logData.data && (
                    <EventDataDisplay hexValue={logData.data} />
                  )}
                  <br />
                  {i < dataLogs.length - 1 && <Divider />}
                </div>
              ))}
          </>
        </Box>
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
