/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import {
  TransactionType,
  deZeroX,
  displayWeiOrTara,
  getTransactionType,
} from '../../utils';
import { Transaction } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import {
  EventData,
  transactionQuery,
  useGetDecodedLogsByTxHash,
  useGetDecodedTransactionsByTxHash,
} from '../../api';

export const useTransactionDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const [showNetworkChanged, setShowNetworkChanged] = useState<boolean>(false);
  const [tabsStep, setTabsStep] = useState<number>(0);
  const [transactionData, setTransactionData] = useState<Transaction>();

  const { initLoading, finishLoading } = useExplorerLoader();
  const [{ fetching, data: txData }] = useQuery({
    query: transactionQuery,
    variables: {
      hash: deZeroX(txHash),
    },
    pause: !txHash,
  });

  const { backendEndpoint } = useExplorerNetwork();
  const txType = getTransactionType(transactionData);
  const { isFetching: isFetchingDecodedTx, data: decodedTxData } =
    useGetDecodedTransactionsByTxHash(
      backendEndpoint,
      txType as TransactionType,
      txHash
    );
  const hasLogs = transactionData?.logs?.length > 0;
  const { isFetching: isFetchingLogs, data: decodedLogData } =
    useGetDecodedLogsByTxHash(backendEndpoint, hasLogs, txHash);
  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);

  const [showLoadingDecodedSkeleton, setShowLoadingDecodedSkeleton] =
    useState<boolean>(false);

  useEffect(() => {
    if (txData?.transaction) {
      setShowNetworkChanged(false);
      setTransactionData({
        ...txData?.transaction,
        value: displayWeiOrTara(txData?.transaction.value),
        gasUsed: `${txData?.transaction.gasUsed}`,
        gasPrice: `${txData?.transaction.gasPrice} Wei`,
        logs: txData?.transaction.logs?.map((log: EventData) => ({
          ...log,
          data: log.data ? JSON.stringify(log.data) : '',
        })),
      });
    }
    if (txData?.transaction === null) {
      setShowNetworkChanged(true);
    }
  }, [txData]);

  useEffect(() => {
    if (fetching || isFetchingDecodedTx || isFetchingLogs) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching, isFetchingDecodedTx, isFetchingLogs]);

  useEffect(() => {
    if (fetching) {
      setShowLoadingSkeleton(true);
    } else {
      setShowLoadingSkeleton(false);
    }
  }, [fetching]);

  useEffect(() => {
    if (isFetchingDecodedTx) {
      setShowLoadingDecodedSkeleton(true);
    } else {
      setShowLoadingDecodedSkeleton(false);
    }
  }, [isFetchingDecodedTx]);

  useEffect(() => {
    if (isFetchingLogs) {
      setShowLoadingDecodedSkeleton(true);
    } else {
      setShowLoadingDecodedSkeleton(false);
    }
  }, [isFetchingLogs]);

  useEffect(() => {
    if (currentNetwork !== network) {
      setShowNetworkChanged(true);
    }
  }, [currentNetwork, network]);

  return {
    tabsStep,
    setTabsStep,
    transactionData,
    decodedTxData,
    decodedLogData,
    currentNetwork,
    showLoadingSkeleton,
    showLoadingDecodedSkeleton,
    showNetworkChanged,
  };
};
