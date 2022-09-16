import React from 'react';
import { Grid } from '@mui/material';
import { BarChart } from '@taraxa_project/taraxa-ui';
import { theme } from '../../theme-provider';
import { DagBlock, PbftBlock } from '../../models';
// import {
//   getMockedDagBlocksCard,
//   getMockedPbftBlocksCard,
// } from '../../api/mocks';

export interface ChartContainerProps {
  dagBlocks: DagBlock[];
  pbftBlocks: PbftBlock[];
}

const ChartContainer = ({
  dagBlocks,
  pbftBlocks,
}: ChartContainerProps): JSX.Element => {
  // const dagBlocks = getMockedDagBlocksCard();
  // const pbftBlocks = getMockedPbftBlocksCard();

  return (
    // The implementation below is wrong as the dabBlocks and pbftBlocks cannot be concatenated as they are different objects
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
          labels={pbftBlocks.slice(5).map((block) => block.number.toString())}
          datasets={[
            {
              data: pbftBlocks.slice(5).map((block) => {
                console.log(
                  block.number,
                  block.transactionCount,
                  block.timestamp,
                  pbftBlocks.find((b) => b.number === block.number - 1)
                    .timestamp,
                  block.timestamp -
                    pbftBlocks.find((b) => b.number === block.number - 1)
                      .timestamp
                );
                return (
                  block.transactionCount /
                  ((block.timestamp -
                    pbftBlocks.find((b) => b.number === block.number - 1)
                      .timestamp) /
                    1000)
                );
              }),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='Block Time'
          labels={pbftBlocks.slice(5).map((block) => block.number.toString())}
          datasets={[
            {
              data: pbftBlocks.slice(5).map((block) => {
                return (
                  block.timestamp -
                  pbftBlocks.find((b) => b.number === block.number - 1)
                    .timestamp
                );
              }),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        {/* <BarChart
          title='DAG Block Per Second'
          labels={dagBlocks
            .slice(5)
            .map((block) => block.pbftPeriod.toString())}
          datasets={[
            {
              data: dagBlocks?.slice(5).map((block) => {
                return (
                  block.timestamp -
                  dagBlocks.find((b) => b.pbftPeriod === block.pbftPeriod - 1)
                    .timestamp
                );
              }),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        {/* <BarChart
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
        /> */}
      </Grid>
    )
  );
};

export default ChartContainer;
