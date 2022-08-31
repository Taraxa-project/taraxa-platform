import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { Icons } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import {
  AddressLink,
  DataRow,
  PageTitle,
  TransactionLink,
} from '../../components';
import { useBlockDataContainerEffects } from './BlockDataContainer.effects';
import { BlockTable } from './BlockTable';

const BlockDataContainer = () => {
  const { txHash } = useParams();
  const { blockData, transactions, currentNetwork, onClickTransactions } =
    useBlockDataContainerEffects(txHash);
  return (
    <>
      <PageTitle
        title='DAG Block Info'
        subtitle={`Detailed TARAXA DAG block information on the ${currentNetwork}.`}
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
            alignContent='center'
            justifyContent='flex-start'
            gap='2rem'
          >
            <Icons.Block />
            <Typography
              variant='h6'
              component='h6'
              style={{ fontWeight: 'bold', marginTop: '1.5rem' }}
            >
              {txHash}
            </Typography>
          </Box>
          <DataRow title='Level' data={blockData.block} />
          <DataRow title='Period' data={blockData.period} />
          <DataRow
            title='Timestamp'
            data={`${moment
              .unix(+blockData.timestamp)
              .format('ddd, D MMM gggg (HH:mm:ss)')} GMT`}
          />
          <Divider light />
          <DataRow
            title='Pivot'
            data={<TransactionLink txHash={blockData.pivot} />}
          />
          <DataRow
            title='Sender'
            data={<AddressLink address={blockData.sender} />}
          />
          <DataRow
            title='Signature'
            data={<TransactionLink txHash={blockData.signature} />}
          />
          <DataRow
            title='Verifiable Delay Function'
            data={`${blockData.verifiableDelay}`}
          />
          <Divider light />
        </Box>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='flex-start'
          alignContent='center'
          margin='1rem 1rem 1rem'
          style={{ overflowWrap: 'anywhere' }}
        >
          <BlockTable blockData={transactions} onFilter={onClickTransactions} />
        </Box>
      </Paper>
    </>
  );
};

export default BlockDataContainer;
