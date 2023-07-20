/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import {
  EventData,
  TransactionType,
  deZeroX,
  displayWeiOrTara,
  getTransactionType,
} from '../../utils';
import { Transaction } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { transactionQuery } from '../../api';
import { useGetDecodedLogsByTxHash } from '../../api/explorer-api/fetchDecodedEventLogs';
import { useGetDecodedTransactionsByTxHash } from 'src/api/explorer-api/fetchDecodedTransactions';

export const useTransactionDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const [showNetworkChanged, setShowNetworkChanged] = useState<boolean>(false);
  const [tabsStep, setTabsStep] = useState<number>(0);
  const [transactionData, setTransactionData] = useState<Transaction>();

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
  const hasLogs = transactionData?.logs?.length > 0;
  const { isFetching: isFetchingLogs, data: decodedLogData } =
    useGetDecodedLogsByTxHash(backendEndpoint, hasLogs, txHash);
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
        logs: transactiondata?.transaction.logs?.map((log: EventData) => ({
          ...log,
          data: log.data ? JSON.stringify(log.data) : '',
        })),
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
    if (isFetching) {
      initLoading();
      setShowLoadingDecodedSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingDecodedSkeleton(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (isFetchingLogs) {
      initLoading();
      setShowLoadingDecodedSkeleton(true);
    } else {
      finishLoading();
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
