import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { useDagEffects } from './Dag.effects';
import { PageTitle } from '../../components';

export const DagPage = (): JSX.Element => {
  const {
    rows,
    columns,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount,
  } = useDagEffects();

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
