import { useEffect, useState } from 'react';
import { BlockData, TransactionData } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import {
  getMockedCurrentTransaction,
  getMockedDagBlocks,
  getMockedEvent,
} from '../../api/mocks';

export const useTransactionDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [events, setEvents] = useState<
    { name?: string; from?: string; to?: string; value?: string }[]
  >([{}]);
  const [dagData, setDagData] = useState<BlockData[]>();
  const [transactionData, setTransactionData] = useState<TransactionData>(
    {} as TransactionData
  );
  useEffect(() => {
    setTimeout(() => {
      const txData: TransactionData = getMockedCurrentTransaction();
      setTransactionData(txData);

      const event = getMockedEvent();
      setEvents(event);
    }, 1000);
  }, [txHash]);

  useEffect(() => {
    setTimeout(() => {
      const dag: BlockData[] = getMockedDagBlocks(transactionData.dagLevel);
      setDagData(dag);
    }, 500);
  }, [transactionData]);

  return { transactionData, dagData, events, currentNetwork };
};
