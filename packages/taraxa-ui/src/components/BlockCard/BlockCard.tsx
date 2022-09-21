import React, { FC } from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
} from '@mui/material';
import useStyles from './BlockCard.styles';
import theme from '../theme';
import {
  TransactionDetails,
  TransactionDetailsProps,
} from '../TransactionDetails';

export interface BlockCardProps {
  title: string;
  transactions: TransactionDetailsProps[];
}

export const BlockCard: FC<BlockCardProps> = ({ title, transactions }) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Card className={classes.card} variant='outlined'>
        <CardHeader
          title={title}
          disableTypography
          className={classes.cardHeader}
        />
        <CardContent className={classes.cardContent}>
          {transactions?.length > 0 ? (
            transactions.map(
              (transaction: TransactionDetailsProps, i: number) => (
                <Box key={`${transaction.hash}-${transaction.level}-${i}`}>
                  <TransactionDetails {...transaction} />
                  <Divider
                    light
                    style={{
                      display: i === transactions.length - 1 ? 'none' : '',
                      marginTop: '24px',
                      width: 'auto',
                    }}
                  />
                </Box>
              )
            )
          ) : (
            <Typography>No data available</Typography>
          )}
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};
