import React from 'react';
import { Table, AwardCard } from '@taraxa_project/taraxa-ui';
import { Box } from '@mui/material';
import { PageTitle } from '../../components';
import { useNodesEffects } from './Nodes.effects';

const NodesPage = () => {
  const { blocks, title, subtitle, description, cols, tableData } =
    useNodesEffects();
  return (
    <>
      <PageTitle
        title='Nodes'
        subtitle='List of TARAXA nodes on Mainnet Candidate'
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <AwardCard
          title={title}
          subtitle={subtitle}
          description={description}
          total={blocks}
        />
        <Table rows={tableData} columns={cols} />
      </Box>
    </>
  );
};
export default NodesPage;