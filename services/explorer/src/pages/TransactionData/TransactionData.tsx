import React, { useState } from 'react';
import {
  Box,
  Divider,
  Paper,
  Typography,
  CopyTo,
  Icons,
} from '@taraxa_project/taraxa-ui';
import { useParams } from 'react-router-dom';
import {
  AddressLink,
  DataRow,
  GreenRightArrow,
  HashLink,
  PageTitle,
  TableTabs,
} from '../../components';
import {
  HashLinkType,
  statusToLabel,
  timestampToAge,
  formatTransactionStatus,
  getTransactionType,
} from '../../utils';
import { useTransactionDataContainerEffects } from './TransactionData.effects';
import { BlocksTable } from '../../components/Tables';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import useStyles from './TransactionData.styles';
import { TableTabsProps } from '../../models';
import LoadingSkeletonTx from './LoadingSkeletonTx';

const TransactionDataContainer = (): JSX.Element => {
  const { txHash } = useParams();
  const classes = useStyles();
  const {
    transactionData,
    dagData,
    events,
    currentNetwork,
    showLoadingSkeleton,
    showNetworkChanged,
  } = useTransactionDataContainerEffects(txHash);
  const onCopy = useCopyToClipboard();

  const [dagsRowsPerPage, setDagsRowsPerPage] = useState(25);
  const [dagsPage, setDagsPage] = useState(0);

  const tableTabs: TableTabsProps = {
    tabs: [
      {
        label: 'DAG Blocks',
        index: 0,
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
            totalCount={dagData?.length}
            pageNo={dagsPage}
            rowsPage={dagsRowsPerPage}
            changePage={(p: number) => setDagsPage(p)}
            changeRows={(l: number) => {
              setDagsRowsPerPage(l);
              setDagsPage(0);
            }}
          />
        ),
      },
    ],
    initialValue: 0,
  };

  return (
    <>
      <PageTitle
        title='Transaction'
        subtitle={`Detailed information about this transaction hash on the ${currentNetwork}.`}
      />
      {showLoadingSkeleton ? (
        <LoadingSkeletonTx />
      ) : (
        <Paper elevation={1}>
          {showNetworkChanged ? (
            <Box
              display='flex'
              flexDirection='column'
              alignItems='center'
              p={5}
              gap='2rem'
            >
              <Typography variant='h6' component='h6' color='primary'>
                Sorry, We are unable to locate this transaction
              </Typography>
              <Typography
                variant='h6'
                component='h6'
                color='secondary'
                style={{ fontWeight: 'bold', wordBreak: 'break-all' }}
              >
                {txHash}
              </Typography>
            </Box>
          ) : (
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
                <Typography
                  variant='h6'
                  component='h6'
                  style={{
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: 'auto',
                  }}
                >
                  Tx {txHash}
                </Typography>
                <CopyTo text={txHash} onCopy={onCopy} />
              </Box>
              <DataRow
                title='Status'
                data={statusToLabel(
                  formatTransactionStatus(transactionData?.status)
                )}
              />
              <DataRow
                title='Timestamp'
                data={timestampToAge(transactionData?.block?.timestamp)}
              />
              <DataRow
                title='Block'
                data={
                  <HashLink
                    linkType={HashLinkType.PBFT}
                    width='auto'
                    hash={transactionData?.block?.hash}
                  />
                }
              />
              <Divider light />
              {events?.length !== 0 && (
                <DataRow
                  title='Transaction action'
                  data={events.map((e) => `${e.name}`).join(' ')}
                />
              )}
              <DataRow
                title='Action'
                data={`${getTransactionType(transactionData)}`}
              />
              {transactionData?.value && (
                <DataRow title='Value' data={`${transactionData.value}`} />
              )}
              {transactionData?.from &&
                (transactionData?.to ||
                  transactionData?.createdContract?.address) && (
                  <DataRow
                    title='FROM/TO'
                    data={
                      <Box
                        display='flex'
                        flexDirection={{
                          xs: 'column',
                          md: 'column',
                          lg: 'row',
                          xl: 'row',
                        }}
                        gap='1rem'
                        width='100%'
                      >
                        <AddressLink
                          width='auto'
                          address={transactionData.from?.address}
                        />
                        <Box>
                          <GreenRightArrow />
                        </Box>
                        <AddressLink
                          width='auto'
                          address={
                            transactionData.to?.address ||
                            transactionData.createdContract?.address
                          }
                        />
                      </Box>
                    }
                  />
                )}
              {transactionData?.gas && transactionData?.gasPrice && (
                <DataRow
                  title='Gas Used/ Gas Limit'
                  data={`${transactionData.gasUsed} / ${transactionData.gas}`}
                />
              )}
              {transactionData?.gasPrice && (
                <DataRow
                  title='Gas Price'
                  data={`${transactionData.gasPrice}`}
                />
              )}
              <DataRow title='Nonce' data={`${transactionData?.nonce}`} />
              {transactionData?.inputData &&
                transactionData?.inputData !== '0x' && (
                  <DataRow title='Data' data={`${transactionData.inputData}`} />
                )}
              <Divider light />
              {dagData?.length && (
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='flex-start'
                  alignContent='center'
                  style={{ overflowWrap: 'anywhere' }}
                >
                  <TableTabs {...tableTabs} />
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}
    </>
  );
};
export default TransactionDataContainer;
