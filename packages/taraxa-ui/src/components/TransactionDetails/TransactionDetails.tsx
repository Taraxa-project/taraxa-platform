import React, { FC } from 'react';
import { Box, CssBaseline, ThemeProvider, Typography } from '@mui/material';
import useStyles from './TransactionDetails.styles';
import theme from '../theme';
import { Block, Route } from '../Icons';

export interface TransactionDetailsProps {
  hash: string;
  transactionCount: number;
  timeSince: string;
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

export const TransactionDetails: FC<TransactionDetailsProps> = ({
  hash,
  transactionCount,
  timeSince,
  hashElement,
  level,
  blockNumber,
}) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.wrapper}>
        <Box className={classes.details}>
          <Block />
          {level && (
            <Typography variant='body2' color='common.white' minWidth='125px'>
              <strong>Level: </strong> {level}
            </Typography>
          )}
          {blockNumber && (
            <Typography variant='body2' color='common.white' minWidth='125px'>
              <strong>Block No.: </strong> {blockNumber}
            </Typography>
          )}
          {hashElement ? (
            <Box className={classes.hashContainer}>{hashElement}</Box>
          ) : (
            <Typography variant='body2' color='secondary'>
              {shortenHash(hash)}
            </Typography>
          )}
        </Box>
        <Box className={classes.details}>
          <Route />
          <Typography variant='body2' color='grey.100'>
            {transactionCount || 0} transactions - {timeSince} ago
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
