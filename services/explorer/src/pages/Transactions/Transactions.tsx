import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { useTransactionEffects } from './Transactions.effects';
import { PageTitle } from '../../components';

const TransactionsPage = (): JSX.Element => {
  const { rows, columns, currentNetwork } = useTransactionEffects();

  return (
    <>
      <PageTitle
        title='Transactions'
        subtitle={`Transactions list on the ${currentNetwork}: showing the last ${
          rows ? rows.length : 0
        }
          records.`}
      />
      <Table rows={rows} columns={columns} />
    </>
  );
};

export default TransactionsPage;
