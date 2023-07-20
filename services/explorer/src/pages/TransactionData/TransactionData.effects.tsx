/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import {
  TransactionType,
  deZeroX,
  displayWeiOrTara,
  getTransactionType,
} from '../../utils';
import { BlockData, CallData, Transaction } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { transactionQuery } from '../../api';
import { useGetDecodedTransactionsByTxHash } from 'src/api/explorer-api/fetchDecodedTransactions';

export const useTransactionDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const [showNetworkChanged, setShowNetworkChanged] = useState<boolean>(false);

  const [events] = useState<
    { name?: string; from?: string; to?: string; value?: string }[]
  >([]);
  const [transactionData, setTransactionData] = useState<Transaction>();
  const [callData, setCallData] = useState<CallData>();

  const { initLoading, finishLoading } = useExplorerLoader();
  const [{ fetching, data: transactiondata }] = useQuery({
    query: transactionQuery,
    variables: {
      hash: deZeroX(txHash),
    },
    pause: !txHash,
  });

  const { backendEndpoint } = useExplorerNetwork();
  const txType = getTransactionType(transactionData);
  const { isFetching, data: decodedTxData } = useGetDecodedTransactionsByTxHash(
    backendEndpoint,
    txType as TransactionType,
    txHash
  );
  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);

  const [showLoadingDecodedSkeleton, setShowLoadingDecodedSkeleton] =
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
    if (decodedTxData && decodedTxData.data && decodedTxData.status === 200) {
      setCallData(decodedTxData.data.calldata);
    }
  }, [decodedTxData]);

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
    if (isFetching) {
      initLoading();
      setShowLoadingDecodedSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingDecodedSkeleton(false);
    }
  }, [fetching]);

  useEffect(() => {
    if (currentNetwork !== network) {
      setShowNetworkChanged(true);
    }
  }, [currentNetwork, network]);

  return {
    transactionData,
    callData,
    events,
    currentNetwork,
    showLoadingSkeleton,
    showLoadingDecodedSkeleton,
    showNetworkChanged,
  };
};
