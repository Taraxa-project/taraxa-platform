import React, { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  Paper,
  Typography,
  CopyTo,
  Icons,
  BaseTooltip,
} from '@taraxa_project/taraxa-ui';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DataRow,
  HashLink,
  PageTitle,
  TableTabs,
  TransactionIcon,
} from '../../components';
import { useDAGDataContainerEffects } from './DAGDataContainer.effects';
import {
  deZeroX,
  HashLinkType,
  timestampToDate,
  timestampToFormattedTime,
  zeroX,
} from '../../utils';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { TableTabsProps } from '../../models';
import useStyles from './DAGDataContainer.styles';
import { TransactionsTable } from '../../components/Tables';
import DagLoadingSkeleton from './DagLoadingSkeleton';

const DAGDataContainer = (): JSX.Element => {
  const { identifier } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const decimalNumberRegex = /^\d+$/;
    const isDecimalNumber = decimalNumberRegex.test(identifier);
    if (isDecimalNumber) {
      navigate(`/pbft/${identifier}`);
    }
  }, [identifier, navigate]);

  const classes = useStyles();
  const {
    blockData,
    transactions,
    currentNetwork,
    showLoadingSkeleton,
    showNetworkChanged,
  } = useDAGDataContainerEffects(deZeroX(identifier));
  const onCopy = useCopyToClipboard();

  const [txRowsPerPage, setTxRowsPerPage] = useState(25);
  const [txPage, setTxPage] = useState(0);

  const tableTabs: TableTabsProps = {
    tabs: [],
    initialValue: 0,
  };

  if (transactions?.length > 0) {
    tableTabs.tabs.push({
      label: 'Transactions',
      index: 0,
      icon: (
        <Box className={classes.tabIconContainer}>
          <TransactionIcon />
        </Box>
      ),
      iconPosition: 'start',
      children: (
        <TransactionsTable
          transactionsData={transactions?.slice(
            txPage * txRowsPerPage,
            txPage * txRowsPerPage + txRowsPerPage
          )}
          totalCount={transactions.length}
          pageNo={txPage}
          rowsPage={txRowsPerPage}
          changePage={(p: number) => setTxPage(p)}
          changeRows={(l: number) => {
            setTxRowsPerPage(l);
            setTxPage(0);
          }}
        />
      ),
    });
  }

  return (
    <>
      <PageTitle
        title='DAG Block Info'
        subtitle={`Detailed TARAXA DAG block information on the ${currentNetwork}.`}
      />
      {showLoadingSkeleton ? (
        <DagLoadingSkeleton />
      ) : (
        <Paper elevation={1}>
          {showNetworkChanged ? (
            <Box
              display='flex'
              flexDirection='column'
              alignItems='center'
              p={5}
              gap='2rem'
            >
              <Typography variant='h6' component='h6' color='primary'>
                Sorry, We are unable to locate this block
              </Typography>
              <Typography
                variant='h6'
                component='h6'
                color='secondary'
                style={{ fontWeight: 'bold', wordBreak: 'break-all' }}
              >
                {zeroX(identifier)}
              </Typography>
            </Box>
          ) : (
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
                  {zeroX(identifier)}
                </Typography>
                <CopyTo text={identifier} onCopy={onCopy} />
              </Box>
              <DataRow title='Level' data={`${blockData?.level || ''}`} />
              <DataRow title='Period' data={`${blockData?.pbftPeriod || ''}`} />
              {blockData.timestamp && (
                <DataRow
                  title='Timestamp'
                  data={
                    <BaseTooltip
                      text={timestampToDate(
                        +(blockData ? blockData.timestamp : 0)
                      )}
                    >
                      {timestampToFormattedTime(
                        +(blockData ? blockData.timestamp : 0)
                      )}
                    </BaseTooltip>
                  }
                />
              )}
              {(blockData?.level ||
                blockData?.pbftPeriod ||
                blockData.timestamp) && <Divider light />}
              {blockData?.pivot && (
                <DataRow
                  title='Pivot'
                  data={
                    <HashLink
                      linkType={HashLinkType.BLOCKS}
                      width='auto'
                      hash={blockData?.pivot}
                    />
                  }
                />
              )}
              {blockData?.author?.address && (
                <DataRow
                  title='Sender'
                  data={
                    <HashLink
                      linkType={HashLinkType.ADDRESSES}
                      width='auto'
                      hash={blockData?.author?.address}
                    />
                  }
                />
              )}
              <DataRow
                title='Signature'
                data={
                  <Typography style={{ wordBreak: 'break-all' }}>
                    {blockData?.signature ? blockData?.signature : 'Loading...'}
                  </Typography>
                }
              />
              <DataRow
                title='Verifiable Delay Function'
                data={blockData?.vdf?.toString() || '0'}
              />
              {transactions?.length > 0 ? (
                <>
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
                </>
              ) : (
                <Box pt={1}></Box>
              )}
            </Box>
          )}
        </Paper>
      )}
    </>
  );
};

export default DAGDataContainer;
