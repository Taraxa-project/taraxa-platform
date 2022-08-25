import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { toTableRow } from '../../components/TransactionRow/TransactionRow';
import { useTransactionsEffects } from './Transactions.effects';
import { PageTitle } from '../../components';

const TransactionsPage = () => {
  const { data, columns } = useTransactionsEffects();
  const rows = data ? data.map((row) => toTableRow(row)) : [];
  return (
    <>
      <PageTitle
        title='Transactions'
        subtitle='Transactions list on the Californicum Testnet: showing the last 500k
          records.'
      />
      <Table rows={rows} columns={columns} />
    </>
  );
};

export default TransactionsPage;
