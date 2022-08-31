import React, { FC } from 'react';
import { Box, CssBaseline, ThemeProvider, Typography } from '@mui/material';
import useStyles from './TransactionDetails.styles';
import theme from '../theme';
import { Block, Route } from '../Icons';

export interface TransactionDetailsProps {
  level: string;
  hash: string;
  transactionCount: number;
  timeSince: string;
}

export const shortenHash = (text: string, visibleLength = 44): string => {
  if (!text || text.length <= 44) {
    return text;
  }
  return `${text.substring(0, visibleLength).replace(/\s+$/, '')}...`;
};

export const TransactionDetails: FC<TransactionDetailsProps> = ({
  level,
  hash,
  transactionCount,
  timeSince,
}) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.wrapper}>
        <Box className={classes.details}>
          <Block />
          <Typography variant='body2' color='common.white'>
            <strong>Level: </strong> {level}
          </Typography>
          <Typography variant='body2' color='secondary'>
            {shortenHash(hash)}
          </Typography>
        </Box>
        <Box className={classes.details}>
          <Route />
          <Typography variant='body2' color='grey.100'>
            {transactionCount} transactions - {timeSince} ago
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
