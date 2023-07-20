import React from 'react';
import {
  Box,
  Divider,
  Paper,
  Typography,
  CopyTo,
} from '@taraxa_project/taraxa-ui';
import { useParams } from 'react-router-dom';
import {
  AddressLink,
  DataRow,
  GreenRightArrow,
  HashLink,
  PageTitle,
} from '../../components';
import {
  HashLinkType,
  statusToLabel,
  timestampToAge,
  formatTransactionStatus,
  getTransactionType,
  TransactionType,
} from '../../utils';
import { useTransactionDataContainerEffects } from './TransactionData.effects';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import LoadingSkeletonTx, { DecodedLoadingSkeleton } from './LoadingSkeletonTx';
import TransactionDataTabs from './TransactionDataTabs';
import { CallData } from '../../models';

const TransactionDataContainer = (): JSX.Element => {
  const { txHash } = useParams();
  const {
    transactionData,
    decodedTxData,
    events,
    currentNetwork,
    showLoadingSkeleton,
    showLoadingDecodedSkeleton,
    showNetworkChanged,
  } = useTransactionDataContainerEffects(txHash);
  const onCopy = useCopyToClipboard();

  const callData = decodedTxData?.data?.calldata as CallData;
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
              pb={3}
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
              {(getTransactionType(transactionData) ===
                TransactionType.Contract_Call ||
                getTransactionType(transactionData) ===
                  TransactionType.Contract_Creation) && (
                <TransactionDataTabs txHash={txHash} />
              )}
              <Divider />
              <Typography variant='h6' component='h6' color='primary'>
                Decoded function data
              </Typography>
              {showLoadingDecodedSkeleton ? (
                <DecodedLoadingSkeleton />
              ) : (
                <>
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
                          Array.isArray(param)
                            ? param.join(', ')
                            : param || 'Not Set'
                        }`}
                      />
                    ))}
                </>
              )}
            </Box>
          )}
        </Paper>
      )}
    </>
  );
};
export default TransactionDataContainer;
