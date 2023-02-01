import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { theme } from '@taraxa_project/taraxa-ui';
import { HashLinkType, zeroX } from '../../utils';

export const HashLink = ({
  linkType,
  hash,
  blockNumber,
  wrap,
  width,
  disabled = false,
}: {
  linkType: HashLinkType;
  hash?: string;
  blockNumber?: number;
  wrap?: boolean;
  width?: string;
  disabled?: boolean;
}): JSX.Element => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'start' }}>
      <Link
        to={`/${linkType}/${zeroX(hash) || blockNumber}`}
        style={{
          textDecoration: 'none',
          color: disabled
            ? theme.palette.grey[500]
            : theme.palette.secondary.main,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          width,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {hash ? (wrap ? `${zeroX(hash).slice(0, 8)}...` : zeroX(hash)) : hash}
        {wrap && blockNumber
          ? `${blockNumber.toString().slice(0, 8)}...`
          : blockNumber}
      </Link>
    </Box>
  );
};
