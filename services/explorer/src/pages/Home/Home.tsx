import React from 'react';
import { Box } from '@mui/material';
import { BlockCard } from '@taraxa_project/taraxa-ui';
import { PageTitle } from '../../components';
import { useHomeEffects } from './Home.effects';
import ChartContainer from './ChartContainer';
import useStyles from './Home.styles';

const HomePage = () => {
  const {
    currentNetwork,
    dagBlocks,
    pbftBlocks,
    dagsForLastFivePeriods,
    dagToDisplay,
    pbftToDisplay,
  } = useHomeEffects();
  const classes = useStyles();

  return (
    <>
      <PageTitle
        title={currentNetwork}
        subtitle='Search for addresses, block hashes, transactions...'
      />
      <ChartContainer
        pbftBlocks={pbftBlocks}
        dagBlocks={dagBlocks}
        dagsForLastFivePeriods={dagsForLastFivePeriods}
      />
      <Box className={classes.blocksWrapper}>
        <BlockCard {...dagToDisplay(dagBlocks?.slice(0, 10).reverse())} />
        <BlockCard {...pbftToDisplay(pbftBlocks?.slice(0, 10).reverse())} />
      </Box>
    </>
  );
};
export default HomePage;
