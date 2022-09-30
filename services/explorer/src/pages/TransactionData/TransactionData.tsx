import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { CopyTo, Icons } from '@taraxa_project/taraxa-ui';
import { useParams } from 'react-router-dom';
import {
  AddressLink,
  DataRow,
  GreenRightArrow,
  HashLink,
  PageTitle,
  TableTabs,
} from '../../components';
import {
  HashLinkType,
  statusToLabel,
  timestampToAge,
  formatTransactionStatus,
} from '../../utils';
import { useTransactionDataContainerEffects } from './TransactionData.effects';
import { BlocksTable } from '../../components/Tables';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import useStyles from './TransactionData.styles';
import { TableTabsProps } from '../../models';

const TransactionDataContainer = (): JSX.Element => {
  const { txHash } = useParams();
  const classes = useStyles();
  const { transactionData, dagData, events, currentNetwork } =
    useTransactionDataContainerEffects(txHash);
  const onCopy = useCopyToClipboard();

  const tableTabs: TableTabsProps = {
    tabs: [
      {
        label: 'DAG Blocks',
        index: 0,
        icon: (
          <Box className={classes.tabIconContainer}>
            <Icons.Block />
          </Box>
        ),
        iconPosition: 'start',
        children: <BlocksTable blocksData={dagData} type='dag' />,
      },
    ],
    initialValue: 0,
  };

  return (
    <>
      <PageTitle
        title='Transaction hash'
        subtitle={`Detailed information about this transaction hash on the ${currentNetwork}.`}
      />
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
            <Typography
              variant='h6'
              component='h6'
              style={{
                fontWeight: 'bold',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                width: 'auto',
              }}
            >
              Tx {txHash}
            </Typography>
            <CopyTo text={txHash} onCopy={onCopy} />
          </Box>
          <DataRow
            title='Status'
            data={statusToLabel(
              formatTransactionStatus(transactionData?.status)
            )}
          />
          <DataRow
            title='Timestamp'
            data={timestampToAge(transactionData?.block?.timestamp)}
          />
          <DataRow
            title='Block'
            data={
              <HashLink
                linkType={HashLinkType.PBFT}
                width='auto'
                hash={transactionData?.block?.hash}
              />
            }
          />
          <Divider light />
          {events?.length !== 0 && (
            <DataRow
              title='Transaction action'
              data={events.map((e) => `${e.name}`).join(' ')}
            />
          )}
          {transactionData?.value && (
            <DataRow
              title='Value'
              data={(+transactionData.value)?.toLocaleString()}
            />
          )}
          {transactionData?.from && transactionData?.to && (
            <DataRow
              title='FROM/TO'
              data={
                <Box
                  display='flex'
                  flexDirection={{
                    xs: 'column',
                    md: 'column',
                    lg: 'row',
                    xl: 'row',
                  }}
                  gap='1rem'
                  width='100%'
                >
                  <AddressLink
                    width='auto'
                    address={transactionData?.from?.address}
                  />
                  <Box>
                    <GreenRightArrow />
                  </Box>
                  <AddressLink
                    width='auto'
                    address={transactionData?.to?.address}
                  />
                </Box>
              }
            />
          )}
          {transactionData?.gas && transactionData?.gasPrice && (
            <DataRow
              title='Gas Limit/ Gas Used'
              data={`${(+transactionData.gas)?.toLocaleString()} /
            ${(+transactionData.gasUsed)?.toLocaleString()}`}
            />
          )}
          {transactionData?.gasPrice && (
            <DataRow
              title='Gas Price'
              data={`${(+transactionData.gasPrice)?.toLocaleString()} TARA`}
            />
          )}
          <DataRow title='Nonce' data={`${transactionData?.nonce}`} />
          <Divider light />
          {dagData?.length && (
            <Box
              display='flex'
              flexDirection='column'
              alignItems='flex-start'
              alignContent='center'
              style={{ overflowWrap: 'anywhere' }}
            >
              <TableTabs {...tableTabs} />
            </Box>
          )}
        </Box>
      </Paper>
    </>
  );
};
export default TransactionDataContainer;
