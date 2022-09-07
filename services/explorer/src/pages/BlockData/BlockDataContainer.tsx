import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { Icons } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { DataRow, HashLink, PageTitle } from '../../components';
import { useBlockDataContainerEffects } from './BlockDataContainer.effects';
import { BlockTable } from './BlockTable';
import { HashLinkType } from '../../utils';

const BlockDataContainer = (): JSX.Element => {
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
            justifyContent='flex-start'
            gap='2rem'
            mt={3}
          >
            <Icons.Block />
            <Typography
              variant='h6'
              component='h6'
              style={{ fontWeight: 'bold', wordBreak: 'break-all' }}
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
            data={
              <HashLink
                linkType={HashLinkType.TRANSACTIONS}
                width='auto'
                hash={blockData?.pivot}
              />
            }
          />
          <DataRow
            title='Sender'
            data={
              <HashLink
                linkType={HashLinkType.ADDRESSES}
                width='auto'
                hash={blockData?.sender}
              />
            }
          />
          <DataRow
            title='Signature'
            data={
              <Typography style={{ wordBreak: 'break-all' }}>
                {blockData.signature}
              </Typography>
            }
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
