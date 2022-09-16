import React from 'react';
import { Box } from '@mui/material';
import { BlockCard } from '@taraxa_project/taraxa-ui';
import { PageTitle } from '../../components';
import { useHomeEffects } from './Home.effects';
import ChartContainer from './ChartContainer';
import useStyles from './Home.styles';

const HomePage = () => {
  const { currentNetwork, dagBlocks, pbftBlocks, dagToDisplay, pbftToDisplay } =
    useHomeEffects();
  const classes = useStyles();

  return (
    <>
      <PageTitle
        title={currentNetwork}
        subtitle='Search for addresses, block hashes, transactions...'
      />
      <ChartContainer pbftBlocks={pbftBlocks} dagBlocks={dagBlocks} />
      <Box className={classes.blocksWrapper}>
        <BlockCard {...dagToDisplay(dagBlocks)} />
        <BlockCard {...pbftToDisplay(pbftBlocks)} />
      </Box>
    </>
  );
};
export default HomePage;
