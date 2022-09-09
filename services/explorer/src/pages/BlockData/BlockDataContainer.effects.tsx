import { useCallback, useEffect, useState } from 'react';
import { getMockedBlockDetails, getMockedTransactions } from '../../api/mocks';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { TransactionData, BlockDetails } from '../../models';

export const useBlockDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [blockData, setBlockData] = useState<BlockDetails>({} as BlockDetails);
  const [transactions, setTransactions] = useState<TransactionData[]>([
    {} as TransactionData,
  ]);

  const fetchBlockDetails = useCallback(() => {
    setTimeout(() => {
      const blockDetails: BlockDetails = getMockedBlockDetails(txHash);
      setBlockData(blockDetails);
    }, 500);
  }, []);

  const fetchTransactions = useCallback(() => {
    setTimeout(() => {
      const transactions: TransactionData[] = getMockedTransactions(txHash);
      setTransactions(transactions);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchBlockDetails();
  }, [currentNetwork]);

  useEffect(() => {
    fetchTransactions();
  }, [blockData]);

  return { blockData, transactions, currentNetwork };
};
