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
}: {
  linkType: HashLinkType;
  hash?: string;
  blockNumber?: number;
  wrap?: boolean;
  width?: string;
}): JSX.Element => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'start' }}>
      <Link
        to={`/${linkType}/${hash || blockNumber}`}
        style={{
          textDecoration: 'none',
          color: theme.palette.secondary.main,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          width,
        }}
      >
        {wrap && hash ? `${zeroX(hash).slice(0, 8)}...` : hash}
        {wrap && blockNumber
          ? `${blockNumber.toString().slice(0, 8)}...`
          : blockNumber}
      </Link>
    </Box>
  );
};
