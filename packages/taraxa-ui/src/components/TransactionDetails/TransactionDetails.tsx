import React from 'react';
import { Box, Typography } from '@mui/material';
import useStyles from './TransactionDetails.styles';
import { Block, Route } from '../Icons';

export interface TransactionDetailsProps {
  hash: string;
  transactionCount: number;
  timeSince: React.ReactNode;
  hashElement?: React.ReactNode;
  level?: string;
  blockNumber?: string;
}

export const shortenHash = (text: string, visibleLength = 44): string => {
  if (!text || text.length <= 44) {
    return text;
  }
  return `${text.substring(0, visibleLength).replace(/\s+$/, '')}...`;
};

export const TransactionDetails = ({
  hash,
  transactionCount,
  timeSince,
  hashElement,
  level,
  blockNumber,
}: TransactionDetailsProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.details}>
        <Box flexBasis='20px'>
          <Block />
        </Box>
        {level && (
          <Box flexGrow={1} maxWidth='auto' minWidth='135px'>
            <Typography variant='body2' color='common.white'>
              <strong>Level: </strong> {level}
            </Typography>
          </Box>
        )}
        {blockNumber && (
          <Box flexGrow={1} maxWidth='auto' minWidth='135px'>
            <Typography variant='body2' color='common.white'>
              <strong>Block No.: </strong> {blockNumber}
            </Typography>
          </Box>
        )}
        {hashElement ? (
          <Box flexShrink={1} className={classes.hashContainer}>
            {hashElement}
          </Box>
        ) : (
          <Box flexShrink={1}>
            <Typography
              variant='body2'
              color='secondary'
              className={classes.hash}
            >
              {shortenHash(hash)}
            </Typography>
          </Box>
        )}
      </Box>
      <Box className={classes.details}>
        <Box width='16px'>
          <Route />
        </Box>
        <Typography variant='body2' color='grey.100'>
          {transactionCount || 0} transactions - {timeSince}
        </Typography>
      </Box>
    </Box>
  );
};
