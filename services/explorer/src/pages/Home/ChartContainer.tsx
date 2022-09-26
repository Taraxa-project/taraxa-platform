import React from 'react';
import { Grid } from '@mui/material';
import { BarChart } from '@taraxa_project/taraxa-ui';
import {
  calculateDagBlocksPerSecond,
  calculatePBFTBlockTime,
  calculateTransactionsPerSecond,
  getLatestNDagBlocks,
  getLatestNTimestamps,
} from '../../utils/chartUtils';
import { theme } from '../../theme-provider';
import { DagBlock, PbftBlock } from '../../models';

export interface ChartContainerProps {
  dagBlocks: DagBlock[];
  pbftBlocks: PbftBlock[];
}

const ChartContainer = ({
  dagBlocks,
  pbftBlocks,
}: ChartContainerProps): JSX.Element => {
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
          labels={pbftBlocks
            .slice(0, 5)
            .map((block) => block.number.toString())
            .reverse()}
          datasets={[
            {
              data: calculateTransactionsPerSecond(
                pbftBlocks.slice(0, 6).reverse()
              ),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='Block Time'
          labels={pbftBlocks
            .slice(0, 5)
            .map((block) => block.number.toString())
            .reverse()}
          datasets={[
            {
              data: calculatePBFTBlockTime(pbftBlocks.slice(0, 6).reverse()),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='DAG Blocks Per Second'
          labels={getLatestNTimestamps(
            getLatestNDagBlocks(
              dagBlocks.sort((block) => block.timestamp),
              5
            ),
            5
          ).map(String)}
          datasets={[
            {
              data: calculateDagBlocksPerSecond(
                getLatestNDagBlocks(dagBlocks, 6),
                getLatestNTimestamps(
                  getLatestNDagBlocks(
                    dagBlocks.sort((block) => block.timestamp),
                    6
                  ),
                  6
                )
              ),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='DAG efficiency'
          labels={dagBlocks
            .slice(6)
            .reverse()
            .map((block) => block.level.toString())}
          datasets={[
            {
              data: dagBlocks
                ?.slice(0, 5)
                .reverse()
                .map(
                  (block) =>
                    (block.timestamp -
                      dagBlocks.find((b) => b.level === block.level - 1)
                        .timestamp) /
                    1000
                ),
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
