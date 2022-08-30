import React from 'react';
import { Box } from '@mui/material';
import { BlockCard } from '@taraxa_project/taraxa-ui';
import { timestampToAge } from '../../utils/TransactionRow';
import { PageTitle } from '../../components';
import { useHomeEffects } from './Home.effects';
import ChartContainer from './ChartContainer';

const HomePage = () => {
  const { currentNetwork, dagBlocks, pbftBlocks } = useHomeEffects();

  const dagToDisplay = () => {
    const _tx = dagBlocks?.map((tx) => {
      return {
        level: tx.level,
        hash: tx.hash,
        transactionCount: tx.transactionCount,
        timeSince: timestampToAge(tx.timestamp),
      };
    });
    return {
      title: 'DAG Blocks',
      transactions: _tx,
    };
  };

  const pbftToDisplay = () => {
    const _tx = pbftBlocks?.map((tx) => {
      return {
        level: tx.level,
        hash: tx.hash,
        transactionCount: tx.transactionCount,
        timeSince: timestampToAge(tx.timestamp),
      };
    });
    return {
      title: 'PBFT Blocks',
      transactions: _tx,
    };
  };

  return (
    <>
      <PageTitle
        title={currentNetwork}
        subtitle='Search for addresses, block hashes, transactions...'
      />
      <ChartContainer />
      <Box sx={{ display: 'flex', gap: '24px', width: '100%' }}>
        <BlockCard {...dagToDisplay()} />
        <BlockCard {...pbftToDisplay()} />
      </Box>
    </>
  );
};
export default HomePage;
