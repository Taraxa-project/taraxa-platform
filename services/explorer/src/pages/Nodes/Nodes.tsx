import React from 'react';
import { Table, AwardCard } from '@taraxa_project/taraxa-ui';
import { Box, IconButton, Typography } from '@mui/material';
import { PageTitle } from '../../components';
import { useNodesEffects } from './Nodes.effects';
import { toNodeTableRow } from '../../utils';
import { NodesTableData } from '../../models';
import { DateTime } from 'luxon';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
    handlePreviousWeek,
    handleNextWeek,
    weekNumber,
    year,
    loading,
  } = useNodesEffects();

  const rows =
    tableData && tableData.length > 0
      ? [...tableData.map((row: NodesTableData) => toNodeTableRow(row))]
      : [];

  return (
    <>
      <PageTitle
        title='Nodes'
        subtitle='List of TARAXA nodes on Mainnet Candidate'
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '0.2rem',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
        mb={2}
      >
        <IconButton
          onClick={handlePreviousWeek}
          aria-label='previous'
          color='secondary'
          disabled={loading}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <Typography color='secondary' fontSize='18px'>
          W{weekNumber} {year}
        </Typography>
        <IconButton
          onClick={handleNextWeek}
          disabled={
            (weekNumber === DateTime.now().weekNumber &&
              year === DateTime.now().year) ||
            loading
          }
          aria-label='next'
          color='secondary'
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
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
