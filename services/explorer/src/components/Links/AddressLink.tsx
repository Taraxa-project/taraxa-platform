import { theme } from '@taraxa_project/taraxa-ui';
import React from 'react';
import { Link } from 'react-router-dom';

export const AddressLink = ({ address }: { address: string }): JSX.Element => {
  return (
    <Link
      to={`/addresses/${address}`}
      style={{
        textDecoration: 'none',
        color: theme.palette.secondary.main,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: '30%',
      }}
    >
      {address}
    </Link>
  );
};
