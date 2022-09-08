import React from 'react';
import clsx from 'clsx';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { CopyTo } from '@taraxa_project/taraxa-ui';
import useStyles from './AddressInfo.styles';
import { AddressInfoTable, TransactionDataItem } from './AddressInfoTable';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { DataRow } from '../DataRow';

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
  const onCopy = useCopyToClipboard();

  const pricePerTara = parseFloat(balance) / parseFloat(value);

  return (
    <Paper elevation={1}>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='left'
        margin='2rem 2rem 2rem'
        gap='1.5rem'
      >
        <Box
          display='flex'
          flexDirection='row'
          alignItems='center'
          justifyContent='flex-start'
          gap='2rem'
          mt={3}
        >
          <div
            className={classes.iconContainer}
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{ __html: addressIcon }}
          />
          <Typography
            variant='h6'
            component='h6'
            style={{ fontWeight: 'bold', wordBreak: 'break-all' }}
          >
            {address}
          </Typography>
          <CopyTo text={address} onCopy={onCopy} />
        </Box>
        <Box className={classes.twoColumnFlex}>
          <Box
            display='flex'
            flexDirection='column'
            alignItems='left'
            gap='1.5rem'
          >
            <DataRow title='Balance' data={`${balance} TARA`} />
            <DataRow
              title='Value'
              data={`$${value} ( ${pricePerTara} / TARA )`}
            />
            <DataRow title='Transaction count' data={`${transactionCount}`} />
          </Box>
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
        <Divider light />
        <DataRow title='Total received' data={`${totalReceived} TARA`} />
        <DataRow title='Total sent' data={`${totalSent} TARA`} />
        <DataRow title='Fees' data={`${fees} TARA`} />
        <Divider light />
      </Box>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='flex-start'
        alignContent='center'
        margin='1rem 1rem 1rem'
        style={{ overflowWrap: 'anywhere' }}
      >
        <AddressInfoTable blockData={blockData} />
      </Box>
    </Paper>
  );
};
