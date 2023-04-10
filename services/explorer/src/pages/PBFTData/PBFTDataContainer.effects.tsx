import { useEffect, useState } from 'react';
import cleanDeep from 'clean-deep';
import { useQuery } from 'urql';
import { blockQuery, blockTransactionsQuery } from '../../api';
import { useExplorerLoader, useExplorerNetwork } from '../../hooks';
import { PbftBlock, Transaction } from '../../models';
import { useIndexer } from '../../hooks/useIndexer';
import { useGetGenesisBlock } from '../../api';
import { displayWeiOrTara, getTransactionType } from '../../utils';

export const usePBFTDataContainerEffects = (
  blockNumber?: number,
  txHash?: string
): {
  blockData?: PbftBlock;
  transactions: Transaction[];
  transactionsTotal: number;
  transactionsPage: number;
  transactionsRowsPerPage: number;
  transactionsHandleChangePage: (p: number) => void;
  transactionsHandleChangeRowsPerPage: (l: number) => void;
  currentNetwork: string;
  showLoadingSkeleton: boolean;
} => {
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState<boolean>(true);
  const [blockData, setBlockData] = useState<PbftBlock | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState<number>(0);

  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();

  const [{ fetching: isFetchingBlock, data: blockResponse }] = useQuery({
    query: blockQuery,
    variables: cleanDeep({
      number: blockNumber,
      hash: txHash,
    }),
    pause: !(blockNumber !== null || blockNumber !== undefined) && !txHash,
  });

  useEffect(() => {
    if (blockResponse && blockResponse.block) {
      setBlockData(blockResponse.block);
    }
  }, [blockResponse]);

  const [
    { fetching: isFetchingTransactions, data: blockTransactionsResponse },
  ] = useQuery({
    query: blockTransactionsQuery,
    variables: cleanDeep({
      number: blockNumber,
      hash: txHash,
    }),
    pause: !blockData || blockData.transactionCount === 0 || blockNumber === 0,
  });

  const {
    data: genesisTransactions,
    total: genesisTransactionsTotal,
    page: transactionsPage,
    rowsPerPage: transactionsRowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useIndexer(
    { queryName: 'pbft-data' },
    useGetGenesisBlock,
    blockNumber !== 0
  );

  useEffect(() => {
    if (
      blockTransactionsResponse &&
      blockTransactionsResponse.block &&
      blockTransactionsResponse.block.transactions
    ) {
      const trx = blockTransactionsResponse.block.transactions;
      setTransactions(
        trx
          .map((tx: Transaction) => ({
            ...tx,
            value: displayWeiOrTara(tx.value),
            gasUsed: `${tx.gasUsed} Wei`,
            gas: `${
              parseInt(`${tx.gasUsed}`, 10) * parseInt(`${tx.gasPrice}`, 10)
            } Wei`,
            action: getTransactionType(tx),
          }))
          .slice(
            transactionsPage * transactionsRowsPerPage,
            transactionsPage * transactionsRowsPerPage + transactionsRowsPerPage
          )
      );
      setTransactionsTotal(trx.length);
    }
  }, [blockTransactionsResponse, transactionsPage, transactionsRowsPerPage]);

  useEffect(() => {
    if (blockNumber === 0 && genesisTransactions) {
      setTransactions(genesisTransactions);
      setTransactionsTotal(genesisTransactionsTotal);
    }
  }, [blockNumber, genesisTransactions, genesisTransactionsTotal]);

  useEffect(() => {
    if (isFetchingBlock || isFetchingTransactions) {
      initLoading();
      setShowLoadingSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingSkeleton(false);
    }
  }, [isFetchingBlock, isFetchingTransactions]);

  return {
    blockData,
    transactions,
    transactionsTotal,
    transactionsPage,
    transactionsRowsPerPage,
    transactionsHandleChangePage: handleChangePage,
    transactionsHandleChangeRowsPerPage: handleChangeRowsPerPage,
    currentNetwork,
    showLoadingSkeleton,
  };
};
