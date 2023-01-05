import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import { dagDetailsQuery } from '../../api';
import { useExplorerLoader, useExplorerNetwork } from '../../hooks';
import { DagBlock, Transaction } from '../../models';

export const useDAGDataContainerEffects = (
  hash: string
): {
  blockData: DagBlock;
  transactions: Transaction[];
  currentNetwork: string;
} => {
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (data?.dagBlock) {
      setBlockData(data?.dagBlock);
      setTransactions(data?.dagBlock?.transactions);
    }
  }, [data]);

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching, currentNetwork]);

  useEffect(() => {
    if (currentNetwork !== network) {
      navigate(-1);
    }
  }, [currentNetwork, network]);

  return { blockData, transactions, currentNetwork };
};
