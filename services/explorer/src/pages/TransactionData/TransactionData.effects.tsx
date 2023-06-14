/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { deZeroX, displayWeiOrTara } from '../../utils';
import { BlockData, Transaction } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { transactionQuery } from '../../api';

export const useTransactionDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const [showNetworkChanged, setShowNetworkChanged] = useState<boolean>(false);

  const [events] = useState<
    { name?: string; from?: string; to?: string; value?: string }[]
  >([]);
  const [transactionData, setTransactionData] = useState<Transaction>();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [{ fetching, data: transactiondata }] = useQuery({
    query: transactionQuery,
    variables: {
      hash: deZeroX(txHash),
    },
    pause: !txHash,
  });
  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);

  useEffect(() => {
    if (transactiondata?.transaction) {
      setShowNetworkChanged(false);
      setTransactionData({
        ...transactiondata?.transaction,
        value: displayWeiOrTara(transactiondata?.transaction.value),
        gasUsed: `${transactiondata?.transaction.gasUsed}`,
        gasPrice: `${transactiondata?.transaction.gasPrice} Wei`,
      });
    }
    if (transactiondata?.transaction === null) {
      setShowNetworkChanged(true);
    }
  }, [transactiondata]);

  useEffect(() => {
    if (fetching) {
      initLoading();
      setShowLoadingSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingSkeleton(false);
    }
  }, [fetching]);

  useEffect(() => {
    if (currentNetwork !== network) {
      setShowNetworkChanged(true);
    }
  }, [currentNetwork, network]);

  return {
    transactionData,
    events,
    currentNetwork,
    showLoadingSkeleton,
    showNetworkChanged,
  };
};
