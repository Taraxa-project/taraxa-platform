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
            {transactionCount || 0} transactions - {timeSince} ago
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
