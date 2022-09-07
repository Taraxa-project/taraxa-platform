import React from 'react';
import clsx from 'clsx';
import { Box, CssBaseline, Grid, ThemeProvider } from '@mui/material';
import { toSvg } from 'jdenticon';
import { Button, Icons } from '@taraxa_project/taraxa-ui';
import useStyles from './AddressInfo.styles';
import { theme } from '../../theme-provider';
import { BlockTable, TransactionDataItem } from '../BlockTable/BlockTable';

export interface AddressInfoProps {
  address: string;
  blockData: TransactionDataItem[];
  balance: string;
  value: string;
  transactionCount: number;
  totalReceived: string;
  totalSent: string;
  fees: string;
  dagBlocks: number;
  pbftBlocks: number;
}

export const AddressInfo = ({
  address,
  balance,
  blockData,
  value,
  transactionCount,
  totalReceived,
  totalSent,
  fees,
  dagBlocks,
  pbftBlocks,
}: AddressInfoProps) => {
  const classes = useStyles();
  const addressIcon = toSvg(address, 40, { backColor: '#fff' });

  const pricePerTara = parseFloat(balance) / parseFloat(value);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.container}>
        <Box className={classes.address}>
          <div
            className={classes.iconContainer}
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{ __html: addressIcon }}
          />
          {address}
          <Button
            className={classes.clipboard}
            variant='contained'
            Icon={Icons.Clipboard}
            onClick={() => navigator.clipboard.writeText(address)}
          />
        </Box>
        <Box className={classes.twoColumnFlex}>
          <div>
            <Grid container rowGap={2}>
              <Grid className={classes.gridHeader} item xs={6}>
                BALANCE:
              </Grid>
              <Grid className={classes.gridValue} item xs={6}>
                {balance} TARA
              </Grid>
              <Grid className={classes.gridHeader} item xs={6}>
                VALUE:
              </Grid>
              <Grid className={classes.gridValue} item xs={6}>
                ${value} ( ${pricePerTara} / TARA )
              </Grid>
              <Grid className={classes.gridHeader} item xs={6}>
                TRANSACTION COUNT:
              </Grid>
              <Grid className={classes.gridValue} item xs={6}>
                {transactionCount}
              </Grid>
            </Grid>
          </div>
          <div>
            <Grid container gap={1}>
              <Grid
                item
                xs={12}
                className={clsx(classes.gridHeader, classes.fullWidthHeader)}
              >
                BLOCKS PRODUCED:
              </Grid>
              <Grid className={classes.blocksBox} item>
                <div>{dagBlocks}</div>
                <span>#DAG Blocks</span>
              </Grid>
              <Grid className={classes.blocksBox} item>
                <div>{pbftBlocks}</div>
                <span>#PBFT Blocks</span>
              </Grid>
            </Grid>
          </div>
        </Box>
        <Box className={classes.twoColumnFlex}>
          <div>
            <Grid container rowGap={2}>
              <Grid className={classes.gridHeader} item xs={6}>
                TOTAL RECEIVED:
              </Grid>
              <Grid className={classes.gridValue} item xs={6}>
                {totalReceived} TARA
              </Grid>
              <Grid className={classes.gridHeader} item xs={6}>
                TOTAL SENT:
              </Grid>
              <Grid className={classes.gridValue} item xs={6}>
                {totalSent} TARA
              </Grid>
              <Grid className={classes.gridHeader} item xs={6}>
                FEES:
              </Grid>
              <Grid className={classes.gridValue} item xs={6}>
                {fees} TARA
              </Grid>
            </Grid>
          </div>
        </Box>
        <BlockTable blockData={blockData} />
      </Box>
    </ThemeProvider>
  );
};
