import React from 'react';
import Table from '../../components/Tables/Table';
import { useBlockEffects } from './Blocks.effects';
import { PageTitle } from '../../components';

const BlocksPage = (): JSX.Element => {
  const {
    rows,
    columns,
    currentNetwork,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount,
  } = useBlockEffects();
  return (
    <>
      <PageTitle
        title='Blocks'
        subtitle={`Blocks list on the ${currentNetwork}: showing the last ${
          rows ? rows.length : 0
        }
          records.`}
      />
      <Table
        rows={rows}
        columns={columns}
        fixedLayout={false}
        totalCount={totalCount}
        currentPage={page}
        initialRowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default BlocksPage;
