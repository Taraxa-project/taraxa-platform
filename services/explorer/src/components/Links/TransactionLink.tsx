import { theme } from '@taraxa_project/taraxa-ui';
import React from 'react';
import { Link } from 'react-router-dom';

export const TransactionLink = ({ txHash }: { txHash: string }) => {
  return (
    <Link
      to={`/transactions/${txHash}`}
      style={{
        textDecoration: 'none',
        color: theme.palette.secondary.main,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}
    >
      {txHash}
    </Link>
  );
};
