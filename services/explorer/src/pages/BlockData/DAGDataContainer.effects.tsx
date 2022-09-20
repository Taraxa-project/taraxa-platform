import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { dagDetailsQuery } from '../../api';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { DagBlock, Transaction } from '../../models';

export const useDAGDataContainerEffects = (hash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [blockData, setBlockData] = useState<DagBlock>({} as DagBlock);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {} as Transaction,
  ]);
  const [{ fetching, data }] = useQuery({
    query: dagDetailsQuery,
    variables: {
      hash,
    },
    pause: !hash,
  });
  const { initLoading, finishLoading } = useExplorerLoader();

  const fetchBlockDetails = useCallback(() => {
    setTimeout(() => {
      console.log('dddd: ', data);
      setBlockData(data?.dagBlock);
      setTransactions(data?.dagBlock?.transactions);
    }, 500);
  }, [data]);

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      fetchBlockDetails();
      finishLoading();
    }
  }, [fetching]);

  useEffect(() => {
    fetchBlockDetails();
  }, [currentNetwork]);

  return { blockData, transactions, currentNetwork };
};
