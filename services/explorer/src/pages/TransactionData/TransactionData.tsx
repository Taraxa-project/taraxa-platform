import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { CopyTo, Icons } from '@taraxa_project/taraxa-ui';
import { useParams } from 'react-router-dom';
import {
  AddressLink,
  DataRow,
  GreenRightArrow,
  HashLink,
  PageTitle,
} from '../../components';
import { statusToLabel, timestampToAge } from '../../utils/TransactionRow';
import { useTransactionDataContainerEffects } from './TransactionData.effects';
import { DagTable } from './DagTable';
import { HashLinkType } from '../../utils';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

const TransactionDataContainer = (): JSX.Element => {
  const { txHash } = useParams();
  const { transactionData, dagData, events, currentNetwork } =
    useTransactionDataContainerEffects(txHash);
  const onCopy = useCopyToClipboard();

  return (
    <>
      <PageTitle
        title='Transactions'
        subtitle={`Detailed information about this transaction hash on the ${currentNetwork}.`}
      />
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
            data={statusToLabel(transactionData?.status)}
          />
          <DataRow
            title='Timestamp'
            data={timestampToAge(transactionData?.timestamp)}
          />
          <DataRow
            title='Block'
            data={
              <HashLink
                linkType={HashLinkType.BLOCKS}
                width='auto'
                hash={transactionData?.pbftBlock}
              />
            }
          />
          <Divider light />
          <DataRow
            title='Transaction action'
            data={events.map((e) => `${e.name}`).join(' ')}
          />
          <DataRow
            title='Value'
            data={(+transactionData.value)?.toLocaleString()}
          />
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
                <AddressLink width='auto' address={transactionData.from} />
                <Box>
                  <GreenRightArrow />
                </Box>
                <AddressLink width='auto' address={transactionData.to} />
              </Box>
            }
          />
          <DataRow
            title='Gas Limit/ Gas Used'
            data={`${(+transactionData.gas)?.toLocaleString()} /
            ${(+transactionData.gasLimit)?.toLocaleString()}`}
          />
          <DataRow
            title='Gas Price'
            data={`${(+transactionData.gasPrice)?.toLocaleString()} TARA`}
          />
          <DataRow title='Nonce' data={`${transactionData?.nonce}`} />
          <Divider light />
          <Box
            display='flex'
            flexDirection='row'
            alignItems='center'
            alignContent='center'
            justifyContent='flex-start'
            gap='1rem'
          >
            <Icons.Block />
            <Typography variant='h6' component='h6'>
              DAG Blocks:
            </Typography>
          </Box>
          <DagTable dagData={dagData} />
        </Box>
      </Paper>
    </>
  );
};
export default TransactionDataContainer;
