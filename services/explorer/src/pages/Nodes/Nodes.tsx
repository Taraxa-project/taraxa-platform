import React from 'react';
import { Table, AwardCard } from '@taraxa_project/taraxa-ui';
import { Box } from '@mui/material';
import { PageTitle } from '../../components';
import { useNodesEffects } from './Nodes.effects';
import { toNodeTableRow } from '../../utils';

const NodesPage = (): JSX.Element => {
  const {
    blocks,
    title,
    subtitle,
    description,
    cols,
    tableData,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount,
  } = useNodesEffects();

  const rows = tableData ? tableData.map((row) => toNodeTableRow(row)) : [];

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
        <Table
          rows={rows}
          columns={cols}
          currentPage={page}
          initialRowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalCount={totalCount}
        />
      </Box>
    </>
  );
};
export default NodesPage;
