import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { toBlockTableRow } from '../../utils/TransactionRow';
import { useBlockEffects } from './Blocks.effects';
import { PageTitle } from '../../components';

const BlocksPage = (): JSX.Element => {
  const {
    data,
    columns,
    currentNetwork,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount,
  } = useBlockEffects();
  const rows = data ? [...data.map((row) => toBlockTableRow(row))] : [];
  return (
    <>
      <PageTitle
        title='Blocks'
        subtitle={`Blocks list on the ${currentNetwork}: showing the last ${
          data ? data.length : 0
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
