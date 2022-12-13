import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { useDagEffects } from './Dag.effects';
import { PageTitle } from '../../components';
import { toDagBlockTableRow } from '../../utils';

export const DagPage = (): JSX.Element => {
  const {
    data,
    columns,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount,
  } = useDagEffects();

  const rows = data ? data.map((row) => toDagBlockTableRow(row)) : [];

  return (
    <>
      <PageTitle title='DAG Blocks' subtitle='Detail view of DAG Blocks' />
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
