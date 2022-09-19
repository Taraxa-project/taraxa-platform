import { useCallback, useEffect, useState } from 'react';
import { getMockedBlockDetails, getMockedTransactions } from '../../api/mocks';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { TransactionData, BlockDetails } from '../../models';

export const usePBFTDataContainerEffects = (
  blockNumber?: number,
  txHash?: string
) => {
  const { currentNetwork } = useExplorerNetwork();
  const [blockData, setBlockData] = useState<BlockDetails>({} as BlockDetails);
  const [transactions, setTransactions] = useState<TransactionData[]>([
    {} as TransactionData,
  ]);
  const { initLoading, finishLoading } = useExplorerLoader();

  const fetchBlockDetails = useCallback(() => {
    setTimeout(() => {
      const blockDetails: BlockDetails = getMockedBlockDetails(txHash);
      setBlockData(blockDetails);
    }, 500);
  }, []);

  const fetchTransactions = useCallback(() => {
    initLoading();
    setTimeout(() => {
      const transactions: TransactionData[] = getMockedTransactions(txHash);
      setTransactions(transactions);
      finishLoading();
    }, 1000);
  }, []);

  useEffect(() => {
    fetchBlockDetails();
    fetchTransactions();
  }, [currentNetwork]);

  return { blockData, transactions, currentNetwork };
};
