import { Box, Divider, Paper, Typography } from '@mui/material';
import { Icons } from '@taraxa_project/taraxa-ui';
import React from 'react';
import { useParams } from 'react-router-dom';
import {
  AddressLink,
  DataRow,
  GreenRightArrow,
  PageTitle,
} from '../../components';
import { statusToLabel, timestampToAge } from '../../utils/TransactionRow';
import { useTransactionDataContainerEffects } from './TransactionData.effects';
import { DagTable } from './DagTable';

const TransactionDataContainer = () => {
  const { txHash } = useParams();
  const { transactionData, dagData, events, currentNetwork } =
    useTransactionDataContainerEffects(txHash);
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
          <Typography
            variant='h6'
            component='h6'
            style={{ fontWeight: 'bold', marginTop: '1.5rem' }}
          >
            Tx {txHash}
          </Typography>
          <DataRow
            title='Status'
            data={statusToLabel(transactionData.status)}
          />
          <DataRow
            title='Timestamp'
            data={timestampToAge(transactionData.timestamp)}
          />
          <DataRow title='Block' data={transactionData.pbftBlock} />
          <Divider light />
          <DataRow
            title='Transaction action'
            data={events.map((e) => `${e.name}`).join(' ')}
          />
          <DataRow
            title='Value'
            data={(+transactionData.value).toLocaleString()}
          />
          <DataRow
            title='FROM/TO'
            data={
              <Box
                display='flex'
                flexDirection='row'
                alignItems='center'
                alignContent='center'
                justifyContent='flex-start'
                width='83%'
                gap='1rem'
              >
                <AddressLink address={transactionData.from} />
                <GreenRightArrow />
                <AddressLink address={transactionData.to} />
              </Box>
            }
          />
          <DataRow
            title='Gas Limit/ Gas Used'
            data={`${(+transactionData.gas).toLocaleString()} /
            ${(+transactionData.gasLimit).toLocaleString()}`}
          />
          <DataRow
            title='Gas Price'
            data={`${(+transactionData.gasPrice).toLocaleString()} TARA`}
          />
          <DataRow title='Nonce' data={`${transactionData.nonce}`} />
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
