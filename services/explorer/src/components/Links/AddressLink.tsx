import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '@taraxa_project/taraxa-ui';
import { zeroX } from '../../utils';

export const AddressLink = ({
  address,
  width = '30%',
}: {
  address: string;
  width?: string;
}): JSX.Element => {
  return (
    <Link
      to={`/address/${address}`}
      style={{
        textDecoration: 'none',
        color: theme.palette.secondary.main,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width,
      }}
    >
      {zeroX(address)}
    </Link>
  );
};
