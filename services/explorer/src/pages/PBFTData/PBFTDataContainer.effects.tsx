import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import cleanDeep from 'clean-deep';
import { blockQuery } from '../../api';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { PbftBlock, Transaction } from '../../models';

export const usePBFTDataContainerEffects = (
  blockNumber?: number,
  txHash?: string
) => {
  const { currentNetwork } = useExplorerNetwork();
  const [blockData, setBlockData] = useState<PbftBlock>({} as PbftBlock);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {} as Transaction,
  ]);
  const [{ fetching, data }] = useQuery({
    query: blockQuery,
    variables: cleanDeep({
      number: blockNumber,
      hash: txHash,
    }),
    pause: !blockNumber && !txHash,
  });
  const { initLoading, finishLoading } = useExplorerLoader();

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [currentNetwork, fetching]);

  useEffect(() => {
    if (data?.block) {
      setBlockData(data.block);
      setTransactions(data.block.transactions);
    }
  }, [data]);

  return { blockData, transactions, currentNetwork };
};
