import React from 'react';
import { Table, AwardCard } from '@taraxa_project/taraxa-ui';
import { Box } from '@mui/material';
import { PageTitle } from '../../components';
import { useNodesEffects } from './Nodes.effects';

const NodesPage = (): JSX.Element => {
  const {
    blocks,
    title,
    subtitle,
    description,
    cols,
    tableData,
    formatTableData,
  } = useNodesEffects();
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
        <Table rows={formatTableData(tableData)} columns={cols} />
      </Box>
    </>
  );
};
export default NodesPage;
