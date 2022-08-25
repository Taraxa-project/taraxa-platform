import React from 'react';
import { Table } from '@taraxa_project/taraxa-ui';
import { Container, Typography } from '@mui/material';
import { toTableRow } from '../../components/TransactionRow/TransactionRow';
import { useTransactionsEffects } from './Transactions.effect';

const TransactionsPage = () => {
  const { data, columns } = useTransactionsEffects();
  const rows = data ? data.map((row) => toTableRow(row)) : [];
  return (
    <Container maxWidth='xl'>
      <div style={{ marginTop: '2rem' }}>
        <Typography color='white' variant='h3' component='h3'>
          Transactions
        </Typography>
        <Typography color='gray' variant='subtitle1' component='p'>
          Transactions list on the Californicum Testnet: showing the last 500k
          records.
        </Typography>
      </div>
      <Table rows={rows} columns={columns} />
    </Container>
  );
};

export default TransactionsPage;
