import React from 'react';
import { Grid } from '@mui/material';
import { BarChart } from '@taraxa_project/taraxa-ui';
import { theme } from '../../theme-provider';
import { useHomeEffects } from './Home.effects';

const ChartContainer = (): JSX.Element => {
  const { dagBlocks, pbftBlocks } = useHomeEffects();

  return (
    dagBlocks &&
    pbftBlocks && (
      <Grid
        container
        display='grid'
        justifyContent='start'
        alignItems='start'
        gridTemplateColumns='repeat(auto-fill, minmax(19rem, max-content))'
        gap='2rem'
        style={{ marginBottom: '2rem' }}
      >
        <BarChart
          title='Transactions per second'
          labels={dagBlocks
            .concat(pbftBlocks)
            .sort((a, b) => +b.timestamp - +a.timestamp)
            .slice(0, 6)
            .flatMap((x) => x.level)}
          datasets={[
            {
              data: dagBlocks
                .concat(pbftBlocks)
                .sort((a, b) => +b.timestamp - +a.timestamp)
                .slice(0, 6)
                .flatMap((x) => +x.transactionCount),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='Block Time'
          labels={dagBlocks
            .concat(pbftBlocks)
            .sort((a, b) => +b.timestamp - +a.timestamp)
            .slice(0, 6)
            .flatMap((x) => x.level)}
          datasets={[
            {
              data: dagBlocks
                .concat(pbftBlocks)
                .sort((a, b) => +b.timestamp - +a.timestamp)
                .slice(0, 6)
                .flatMap((x) => +x.transactionCount),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='DAG Block Per Second'
          labels={dagBlocks
            .sort((a, b) => +b.timestamp - +a.timestamp)
            .slice(0, 6)
            .flatMap((x) => x.level)}
          datasets={[
            {
              data: dagBlocks
                .sort((a, b) => +b.timestamp - +a.timestamp)
                .slice(0, 6)
                .flatMap((x) => +x.transactionCount),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='DAG efficiency'
          labels={dagBlocks
            .sort((a, b) => +b.timestamp - +a.timestamp)
            .slice(0, 6)
            .flatMap((x) => x.level)}
          datasets={[
            {
              data: dagBlocks
                .sort((a, b) => +b.timestamp - +a.timestamp)
                .slice(0, 6)
                .flatMap((x) => +x.transactionCount),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
      </Grid>
    )
  );
};

export default ChartContainer;
