import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '@taraxa_project/taraxa-ui';
import { zeroX } from '../../utils';

export const AddressLink = ({
  address,
  width = '30%',
  disabled = false,
}: {
  address: string;
  width?: string;
  disabled?: boolean;
}): JSX.Element => {
  return (
    <Link
      to={`/address/${zeroX(address)}`}
      style={{
        textDecoration: 'none',
        color: theme.palette.secondary.main,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {zeroX(address)}
    </Link>
  );
};
