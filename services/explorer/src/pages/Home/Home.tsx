import React from 'react';
import { Box } from '@mui/material';
import { BlockCard } from '@taraxa_project/taraxa-ui';
import { PageTitle } from '../../components';
import { useHomeEffects } from './Home.effects';
import ChartContainer from './ChartContainer';

const HomePage = () => {
  const { currentNetwork, dagBlocks, pbftBlocks, dagToDisplay, pbftToDisplay } =
    useHomeEffects();

  return (
    <>
      <PageTitle
        title={currentNetwork}
        subtitle='Search for addresses, block hashes, transactions...'
      />
      <ChartContainer />
      <Box sx={{ display: 'flex', gap: '24px', width: '100%' }}>
        <BlockCard {...dagToDisplay(dagBlocks)} />
        <BlockCard {...pbftToDisplay(pbftBlocks)} />
      </Box>
    </>
  );
};
export default HomePage;
