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
  displayWeiOrTara,
} from '../../utils';
import { useTransactionDataContainerEffects } from './TransactionData.effects';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import LoadingSkeletonTx from './LoadingSkeletonTx';
import TransactionDataTabs from './TransactionDataTabs';
import {
  EncodedType,
  HexToDecDataRow,
  PrimitiveType,
} from '../../components/HexToDecDataRow/HexToDecDataRow';

const TransactionDataContainer = (): JSX.Element => {
  const { txHash } = useParams();
  const {
    transactionData,
    hasLogs,
    currentNetwork,
    showLoadingSkeleton,
    showNetworkChanged,
  } = useTransactionDataContainerEffects(txHash);
  const onCopy = useCopyToClipboard();

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
              <DataRow
                title='Action'
                data={`${getTransactionType(transactionData)}`}
              />
              {transactionData?.value && (
                <HexToDecDataRow
                  title='Value'
                  data={`${transactionData.value}`}
                  initialState={EncodedType.DEC}
                  primitiveType={PrimitiveType.UINT}
                  formatDecimal={displayWeiOrTara}
                />
              )}
              {transactionData?.from &&
                (transactionData?.to ||
                  transactionData?.createdContract?.address) && (
                  <DataRow
                    title='From / To'
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
                  title='Gas Used / Gas Limit'
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
                <TransactionDataTabs txHash={txHash} hasLogs={hasLogs} />
              )}
            </Box>
          )}
        </Paper>
      )}
    </>
  );
};
export default TransactionDataContainer;
