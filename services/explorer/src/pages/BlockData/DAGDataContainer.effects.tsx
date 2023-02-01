import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import { dagDetailsQuery } from '../../api';
import { useExplorerLoader, useExplorerNetwork } from '../../hooks';
import { DagBlock, Transaction } from '../../models';
import { displayWeiOrTara } from '../../utils';

export const useDAGDataContainerEffects = (
  hash: string
): {
  blockData: DagBlock;
  transactions: Transaction[];
  currentNetwork: string;
  showLoadingSkeleton: boolean;
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
  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);

  useEffect(() => {
    if (data?.dagBlock) {
      setBlockData(data?.dagBlock);
      setTransactions(
        data?.dagBlock?.transactions?.map((tx: Transaction) => {
          return {
            ...tx,
            value: displayWeiOrTara(tx.value),
            gasUsed: displayWeiOrTara(tx.gasUsed),
          };
        })
      );
    }
  }, [data]);

  useEffect(() => {
    if (fetching) {
      initLoading();
      setShowLoadingSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingSkeleton(false);
    }
  }, [fetching, currentNetwork]);

  useEffect(() => {
    if (currentNetwork !== network) {
      navigate(-1);
    }
  }, [currentNetwork, network]);

  return { blockData, transactions, currentNetwork, showLoadingSkeleton };
};
