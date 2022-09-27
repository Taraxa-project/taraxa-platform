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
    dagsForLastTenPeriods,
    dagToDisplay,
    pbftToDisplay,
  } = useHomeEffects();
  const classes = useStyles();
  const pbftsForCard = pbftBlocks ? [...pbftBlocks] : [];
  const pbftsForCharts = pbftBlocks ? [...pbftBlocks] : [];
  const dagsForCard = dagBlocks ? [...dagBlocks] : [];
  const dagsForCharts = dagBlocks ? [...dagBlocks] : [];

  return (
    <>
      <PageTitle
        title={currentNetwork}
        subtitle='Search for addresses, block hashes, transactions...'
      />
      <ChartContainer
        pbftBlocks={pbftsForCharts}
        dagBlocks={dagsForCharts}
        dagsForLastTenPeriods={dagsForLastTenPeriods}
      />
      <Box className={classes.blocksWrapper}>
        <BlockCard {...dagToDisplay(dagsForCard?.slice(0, 10))} />
        <BlockCard {...pbftToDisplay(pbftsForCard?.slice(0, 10).reverse())} />
      </Box>
    </>
  );
};
export default HomePage;
