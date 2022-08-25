import React, { FC } from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Box,
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
  maxWidth?: number;
}

export const BlockCard: FC<BlockCardProps> = ({
  title,
  transactions,
  maxWidth,
}) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Card
        className={classes.card}
        variant='outlined'
        sx={{ maxWidth: maxWidth || 646 }}
      >
        <CardHeader
          title={title}
          disableTypography
          className={classes.cardHeader}
        />
        <CardContent className={classes.cardContent}>
          {transactions?.length &&
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
            )}
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};
