import React from 'react';
import { Grid } from '@mui/material';
import { BarChart } from '@taraxa_project/taraxa-ui';
import {
  calculateDagBlocksPerSecond,
  calculateDagEfficiencyForPBFT,
  calculatePBFTBlockTime,
  calculateTransactionsPerSecond,
  getLastNDagBlocks,
  getLastNTimestamps,
} from '../../utils';
import { theme } from '../../theme-provider';
import { DagBlock, PbftBlock } from '../../models';

export interface ChartContainerProps {
  dagBlocks: DagBlock[];
  pbftBlocks: PbftBlock[];
  dagsForLastFivePeriods: DagBlock[];
}

const ChartContainer = ({
  dagBlocks,
  pbftBlocks,
  dagsForLastFivePeriods,
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
            .map((block) => block.number.toString())}
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
          tick='s'
          labels={pbftBlocks
            .slice(0, 5)
            .map((block) => block.number.toString())}
          datasets={[
            {
              data: calculatePBFTBlockTime(pbftBlocks.slice(0, 6)),
              borderRadius: 5,
              barThickness: 20,
              backgroundColor: theme.palette.secondary.main,
            },
          ]}
        />
        <BarChart
          title='DAG Blocks Per Second'
          tick=''
          labels={getLastNTimestamps(
            getLastNDagBlocks(
              dagBlocks.sort((block) => block.timestamp),
              5
            ),
            5
          ).map(String)}
          datasets={[
            {
              data: calculateDagBlocksPerSecond(
                getLastNDagBlocks(dagBlocks, 6),
                getLastNTimestamps(
                  getLastNDagBlocks(
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
          labels={pbftBlocks.reverse().map((block) => block.number.toString())}
          tick='%'
          datasets={[
            {
              data: calculateDagEfficiencyForPBFT(
                pbftBlocks,
                dagsForLastFivePeriods
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
