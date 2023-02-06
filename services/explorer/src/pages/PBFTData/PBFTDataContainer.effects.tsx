import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import cleanDeep from 'clean-deep';
import { blockQuery } from '../../api';
import { useExplorerNetwork, useExplorerLoader } from '../../hooks';
import { PbftBlock, Transaction } from '../../models';
import { displayWeiOrTara } from '../../utils';
import { useGetGenesisBlock } from '../../api/explorer-api/fetchGenesisBlock';

export const usePBFTDataContainerEffects = (
  blockNumber?: number,
  txHash?: string
): {
  blockData: PbftBlock;
  transactions: Transaction[];
  currentNetwork: string;
  showLoadingSkeleton: boolean;
  genesisTransactions: Transaction[];
} => {
  const { backendEndpoint, currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const navigate = useNavigate();

  const [blockData, setBlockData] = useState<PbftBlock>({} as PbftBlock);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {} as Transaction,
  ]);
  const [genesisTransactions, setGenesisTransactions] = useState<Transaction[]>(
    [{} as Transaction]
  );
  const [{ fetching, data }] = useQuery({
    query: blockQuery,
    variables: cleanDeep({
      number: blockNumber,
      hash: txHash,
    }),
    pause: !(blockNumber !== null || blockNumber !== undefined) && !txHash,
  });
  const { initLoading, finishLoading } = useExplorerLoader();
  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);

  const {
    data: genesisBlock,
    isFetching: isFetchingGenesis,
    isLoading: isLoadingGenesis,
  } = useGetGenesisBlock(backendEndpoint, blockNumber === 0);

  useEffect(() => {
    if (fetching || isFetchingGenesis || isLoadingGenesis) {
      initLoading();
      setShowLoadingSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingSkeleton(false);
    }
  }, [currentNetwork, fetching, isFetchingGenesis, isLoadingGenesis]);

  useEffect(() => {
    if (data?.block) {
      setBlockData(data.block);
      setTransactions(
        data?.block?.transactions?.map((tx: Transaction) => {
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
    if (genesisBlock?.data) {
      setGenesisTransactions(
        genesisBlock?.data?.transactions?.map((tx: Transaction) => {
          return {
            ...tx,
            value: displayWeiOrTara(tx.value),
            gasUsed: displayWeiOrTara(tx.gasUsed),
          };
        })
      );
    }
  }, [genesisBlock]);

  useEffect(() => {
    if (currentNetwork !== network) {
      navigate(-1);
    }
  }, [currentNetwork, network]);

  return {
    blockData,
    transactions,
    currentNetwork,
    showLoadingSkeleton,
    genesisTransactions,
  };
};
