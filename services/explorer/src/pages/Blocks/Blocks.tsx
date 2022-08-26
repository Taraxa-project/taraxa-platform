import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { toBlockTableRow } from '../../components/TransactionRow/TransactionRow';
import { useBlockEffects } from './Blocks.effects';
import { PageTitle } from '../../components';

const BlocksPage = () => {
  const { data, columns, currentNetwork } = useBlockEffects();
  const rows = data ? data.map((row) => toBlockTableRow(row)) : [];
  return (
    <>
      <PageTitle
        title='Blocks'
        subtitle={`Blocks list on the ${currentNetwork}: showing the last ${
          data ? data.length : 0
        }
          records.`}
      />
      <Table rows={rows} columns={columns} fixedLayout={false} />
    </>
  );
};

export default BlocksPage;
