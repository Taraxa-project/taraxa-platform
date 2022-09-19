import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { CopyTo, Icons } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import {
  DataRow,
  HashLink,
  PageTitle,
  TableTabs,
  TransactionIcon,
} from '../../components';
import { usePBFTDataContainerEffects } from './PBFTDataContainer.effects';
import { HashLinkType, unwrapIdentifier } from '../../utils';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { TableTabsProps } from '../../models';
import useStyles from './PBFTDataContainer.styles';
import { TransactionsTable } from '../../components/Tables';

const PBFTDataContainer = (): JSX.Element => {
  const { identifier } = useParams();
  const classes = useStyles();
  const { txHash, blockNumber } = unwrapIdentifier(identifier);
  const { blockData, transactions, currentNetwork } =
    usePBFTDataContainerEffects(blockNumber, txHash);
  const onCopy = useCopyToClipboard();

  const tableTabs: TableTabsProps = {
    tabs: [
      {
        label: 'Transactions',
        index: 0,
        icon: (
          <Box className={classes.tabIconContainer}>
            <TransactionIcon />
          </Box>
        ),
        iconPosition: 'start',
        children: <TransactionsTable transactionsData={transactions} />,
      },
    ],
    initialValue: 0,
  };

  return (
    <>
      <PageTitle
        title='PBFT Block Info'
        subtitle={`Detailed TARAXA PBFT block information on the ${currentNetwork}.`}
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
            <Icons.Block />
            <Typography
              variant='h6'
              component='h6'
              style={{ fontWeight: 'bold', wordBreak: 'break-all' }}
            >
              {identifier}
            </Typography>
            <CopyTo text={identifier} onCopy={onCopy} />
          </Box>
          <DataRow title='Level' data={`${blockData.block}`} />
          <DataRow title='Period' data={blockData.period} />
          <DataRow
            title='Timestamp'
            data={`${moment
              .unix(+blockData.timestamp)
              .format('ddd, D MMM gggg (HH:mm:ss)')} GMT`}
          />
          <Divider light />
          <DataRow
            title='Pivot'
            data={
              <HashLink
                linkType={HashLinkType.TRANSACTIONS}
                width='auto'
                hash={blockData?.pivot}
              />
            }
          />
          <DataRow
            title='Sender'
            data={
              <HashLink
                linkType={HashLinkType.ADDRESSES}
                width='auto'
                hash={blockData?.sender}
              />
            }
          />
          <DataRow
            title='Signature'
            data={
              <Typography style={{ wordBreak: 'break-all' }}>
                {blockData.signature}
              </Typography>
            }
          />
          <DataRow
            title='Verifiable Delay Function'
            data={`${blockData.verifiableDelay}`}
          />
          <Divider light />
          <Box
            display='flex'
            flexDirection='column'
            alignItems='flex-start'
            alignContent='center'
            style={{ overflowWrap: 'anywhere' }}
          >
            <TableTabs {...tableTabs} />
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default PBFTDataContainer;
