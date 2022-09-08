import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '@taraxa_project/taraxa-ui';

export const AddressLink = ({
  address,
  width = '30%',
}: {
  address: string;
  width?: string;
}): JSX.Element => {
  return (
    <Link
      to={`/addresses/${address}`}
      style={{
        textDecoration: 'none',
        color: theme.palette.secondary.main,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width,
      }}
    >
      {address}
    </Link>
  );
};
