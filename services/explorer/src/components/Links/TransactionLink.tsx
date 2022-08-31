import { theme } from '@taraxa_project/taraxa-ui';
import React from 'react';
import { Link } from 'react-router-dom';

export const TransactionLink = ({
  txHash,
  wrap,
}: {
  txHash: string;
  wrap?: boolean;
}) => {
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
      {wrap && txHash ? `${txHash.slice(0, 8)}...` : txHash}
    </Link>
  );
};
