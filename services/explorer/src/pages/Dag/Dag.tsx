import React from 'react';
import { Box } from '@mui/material';
import { useDagEffects } from './Dag.effects';
import { PageTitle } from '../../components';
import { BlocksTable } from '../../components/Tables';

export const DagPage = () => {
  const { dagBlocks } = useDagEffects();
  return (
    <>
      <PageTitle title='DAG Blocks' subtitle='Detail view of DAG Blocks' />
      <Box>
        <BlocksTable blocksData={dagBlocks} />
      </Box>
    </>
  );
};
