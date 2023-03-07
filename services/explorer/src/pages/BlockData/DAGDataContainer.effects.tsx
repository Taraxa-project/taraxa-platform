import { useEffect, useState } from 'react';
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
  showNetworkChanged: boolean;
} => {
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const [showNetworkChanged, setShowNetworkChanged] = useState<boolean>(false);

  const [blockData, setBlockData] = useState<DagBlock>({} as DagBlock);
  const [transactions, setTransactions] = useState<Transaction[]>();
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
      setShowNetworkChanged(false);
      setBlockData(data?.dagBlock);
      setTransactions(
        data?.dagBlock?.transactions?.map((tx: Transaction) => {
          return {
            ...tx,
            value: displayWeiOrTara(tx.value),
            gasUsed: displayWeiOrTara(tx.gasUsed),
            gas: displayWeiOrTara(
              tx.gasUsed * parseInt(tx.gasPrice.toString(), 10)
            ),
          };
        })
      );
    }
    if (data?.dagBlock === null) {
      setShowNetworkChanged(true);
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
      setShowNetworkChanged(true);
    }
  }, [currentNetwork, network]);

  return {
    blockData,
    transactions,
    currentNetwork,
    showLoadingSkeleton,
    showNetworkChanged,
  };
};
