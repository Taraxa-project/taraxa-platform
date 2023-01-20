import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import { dagDetailsQuery } from '../../api';
import { useExplorerLoader, useExplorerNetwork } from '../../hooks';
import { DagBlock, Transaction } from '../../models';
import { fromWeiToTara, MIN_WEI_TO_CONVERT } from '../../utils';

export const useDAGDataContainerEffects = (
  hash: string
): {
  blockData: DagBlock;
  transactions: Transaction[];
  currentNetwork: string;
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

  useEffect(() => {
    if (data?.dagBlock) {
      setBlockData(data?.dagBlock);
      setTransactions(
        data?.dagBlock?.transactions?.map((tx: Transaction) => {
          return {
            ...tx,
            value:
              Number(tx.value) < MIN_WEI_TO_CONVERT
                ? `${tx.value} Wei`
                : `${fromWeiToTara(ethers.BigNumber.from(tx.value))} TARA`,
            gasUsed:
              Number(tx.gasUsed) < MIN_WEI_TO_CONVERT
                ? `${tx.gasUsed} Wei`
                : `${fromWeiToTara(ethers.BigNumber.from(tx.gasUsed))} TARA`,
          };
        })
      );
    }
  }, [data]);

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching, currentNetwork]);

  useEffect(() => {
    if (currentNetwork !== network) {
      navigate(-1);
    }
  }, [currentNetwork, network]);

  return { blockData, transactions, currentNetwork };
};
