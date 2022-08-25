import React from 'react';
import { Box } from '@mui/material';
import { BlockCard } from '@taraxa_project/taraxa-ui';
import { PageTitle } from '../../components';
import { useHomeEffects } from './Home.effects';

const HomePage = () => {
  const { currentNetwork, dagBlocks, pbftBlocks } = useHomeEffects();

  return (
    <>
      <PageTitle
        title={currentNetwork}
        subtitle='Search for addresses, block hashes, transactions...'
      />
      <Box sx={{ display: 'flex', gap: '24px', width: '100%' }}>
        <BlockCard {...dagBlocks} />
        <BlockCard {...pbftBlocks} />
      </Box>
    </>
  );
};
export default HomePage;
