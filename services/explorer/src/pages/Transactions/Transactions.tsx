import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { toTransactionTableRow } from '../../utils/TransactionRow';
import { useTransactionEffects } from './Transactions.effects';
import { PageTitle } from '../../components';

const TransactionsPage = (): JSX.Element => {
  const { data, columns, currentNetwork } = useTransactionEffects();
  const rows = data ? data.map((row) => toTransactionTableRow(row)) : [];
  return (
    <>
      <PageTitle
        title='Transactions'
        subtitle={`Transactions list on the ${currentNetwork}: showing the last ${
          data ? data.length : 0
        }
          records.`}
      />
      <Table rows={rows} columns={columns} />
    </>
  );
};

export default TransactionsPage;
