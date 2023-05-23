import React from 'react';
import { Box, BlockCard } from '@taraxa_project/taraxa-ui';
import { PageTitle } from '../../components';
import { useHomeEffects } from './Home.effects';
import ChartContainer from './ChartContainer';
import BlockCardSkeleton from './BlockCardSkeleton';

const HomePage = (): JSX.Element => {
  const {
    currentNetwork,
    dagBlocks,
    pbftBlocks,
    dagsForLastTenPeriods,
    dagToDisplay,
    pbftToDisplay,
    fetchingDagBlocks,
    fetchingBlocks,
  } = useHomeEffects();
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
      <Box
        display='flex'
        gap='24px'
        width='100%'
        flexDirection={{ xs: 'column', md: 'column', lg: 'row' }}
      >
        {fetchingDagBlocks || fetchingBlocks ? (
          <>
            <BlockCardSkeleton />
            <BlockCardSkeleton />
          </>
        ) : (
          <>
            <BlockCard {...dagToDisplay(dagsForCard?.slice(0, 10))} />
            <BlockCard
              {...pbftToDisplay(pbftsForCard?.slice(0, 10)?.reverse())}
            />
          </>
        )}
      </Box>
    </>
  );
};
export default HomePage;
