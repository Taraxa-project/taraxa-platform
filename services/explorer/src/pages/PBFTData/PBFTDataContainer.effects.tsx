import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import cleanDeep from 'clean-deep';
import { blockQuery } from '../../api';
import { useExplorerNetwork, useExplorerLoader } from '../../hooks';
import { PbftBlock, Transaction } from '../../models';
import { fromWeiToTara, MIN_WEI_TO_CONVERT } from '../../utils';
import { ethers } from 'ethers';

export const usePBFTDataContainerEffects = (
  blockNumber?: number,
  txHash?: string
): {
  blockData: PbftBlock;
  transactions: Transaction[];
  currentNetwork: string;
} => {
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const navigate = useNavigate();

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
      setTransactions(
        data?.block?.transactions?.map((tx: Transaction) => {
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
    if (currentNetwork !== network) {
      navigate(-1);
    }
  }, [currentNetwork, network]);

  return { blockData, transactions, currentNetwork };
};
