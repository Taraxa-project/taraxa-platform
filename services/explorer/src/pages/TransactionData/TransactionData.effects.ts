/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { deZeroX } from '../../utils';
import { BlockData, Transaction } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { transactionQuery } from '../../api';

export const useTransactionDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [events, setEvents] = useState<
    { name?: string; from?: string; to?: string; value?: string }[]
  >([]);
  const [dagData, setDagData] = useState<BlockData[]>();
  const [transactionData, setTransactionData] = useState<Transaction>();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [{ fetching, data: transactiondata }] = useQuery({
    query: transactionQuery,
    variables: {
      hash: deZeroX(txHash),
    },
    pause: !txHash,
  });

  useEffect(() => {
    if (transactiondata?.transaction) {
      setTransactionData(transactiondata?.transaction);
    }
  }, [transactiondata]);

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching]);

  return { transactionData, dagData, events, currentNetwork };
};
