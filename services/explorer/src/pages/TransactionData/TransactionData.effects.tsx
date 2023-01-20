/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import { deZeroX, fromWeiToTara, MIN_WEI_TO_CONVERT } from '../../utils';
import { BlockData, Transaction } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';
import { transactionQuery } from '../../api';
import { ethers } from 'ethers';

export const useTransactionDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const navigate = useNavigate();
  const [network] = useState(currentNetwork);
  const [events] = useState<
    { name?: string; from?: string; to?: string; value?: string }[]
  >([]);
  const [dagData] = useState<BlockData[]>();
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
      setTransactionData({
        ...transactiondata?.transaction,
        value:
          Number(transactiondata?.transaction.value) < MIN_WEI_TO_CONVERT
            ? `${transactiondata?.transaction.value} Wei`
            : `${fromWeiToTara(
                ethers.BigNumber.from(transactiondata?.transaction.value)
              )} TARA`,
        gasUsed:
          Number(transactiondata?.transaction.gasUsed) < MIN_WEI_TO_CONVERT
            ? `${transactiondata?.transaction.gasUsed} Wei`
            : `${fromWeiToTara(
                ethers.BigNumber.from(transactiondata?.transaction.gasUsed)
              )} TARA`,
        gasPrice:
          Number(transactiondata?.transaction.gasUsed) < MIN_WEI_TO_CONVERT
            ? `${transactiondata?.transaction.gasUsed} Wei`
            : `${fromWeiToTara(
                ethers.BigNumber.from(transactiondata?.transaction.gasUsed)
              )} TARA`,
      });
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
      navigate(-1);
    }
  }, [currentNetwork, network]);

  return {
    transactionData,
    dagData,
    events,
    currentNetwork,
    showLoadingSkeleton,
  };
};
