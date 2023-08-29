/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { AxiosResponse } from 'axios';
import { deZeroX, getTransactionType } from '../../utils';
import { Transaction } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { EventData, transactionQuery } from '../../api';
import { useGetRevertReason } from '../../api/explorer-api';

export const useTransactionDataContainerEffects = (
  txHash: string
): {
  tabsStep: number;
  setTabsStep: React.Dispatch<React.SetStateAction<number>>;
  transactionData: Transaction;
  revertData: AxiosResponse<any>;
  currentNetwork: string;
  showLoadingSkeleton: boolean;
  showNetworkChanged: boolean;
  txType: string;
  hasLogs: boolean;
} => {
  const { currentNetwork, rpcEndpoint } = useExplorerNetwork();
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
  const { data: revertData } = useGetRevertReason(rpcEndpoint, transactionData);

  const txType = getTransactionType(transactionData);
  const hasLogs = transactionData?.logs?.length > 0;

  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);

  useEffect(() => {
    if (txData?.transaction) {
      setShowNetworkChanged(false);
      setTransactionData({
        ...txData?.transaction,
        value: txData?.transaction.value,
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
    tabsStep,
    setTabsStep,
    transactionData,
    revertData,
    currentNetwork,
    showLoadingSkeleton,
    showNetworkChanged,
    txType,
    hasLogs,
  };
};
