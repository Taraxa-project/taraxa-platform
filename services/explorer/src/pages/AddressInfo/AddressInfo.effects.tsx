import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { ethers } from 'ethers';
import { accountQuery } from '../../api/graphql/queries/account';
import { useExplorerLoader } from '../../hooks/useLoader';
import { AddressInfoDetails, BlockData, Transaction } from '../../models';
import {
  useGetBlocksByAddress,
  useGetDagsByAddress,
  useGetDetailsForAddress,
  useGetPbftsByAddress,
  useGetTransactionsByAddress,
} from '../../api';

export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  status: number;
  gasUsed: string;
  gasPrice: string;
  value: string;
  block: number;
  age: number;
}

export const useAddressInfoEffects = (
  account: string
): {
  transactions: Transaction[];
  addressInfoDetails: AddressInfoDetails;
  dagBlocks: BlockData[];
  pbftBlocks: BlockData[];
} => {
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>();
  const [pbftBlocks, setPbftBlocks] = useState<BlockData[]>();
  const [addressInfoDetails, setAddressInfoDetails] =
    useState<AddressInfoDetails>();
  const [{ fetching, data }] = useQuery({
    query: accountQuery,
    variables: { account },
    pause: !account,
  });
  const { initLoading, finishLoading } = useExplorerLoader();
  const {
    data: nodeData,
    isFetching: isFetchingBlocks,
    isLoading: isLoadingBlocks,
  } = useGetBlocksByAddress(account);
  const {
    data: dagsData,
    isFetching: isFetchingDags,
    isLoading: isLoadingDags,
  } = useGetDagsByAddress(account);
  const {
    data: pbftsData,
    isFetching: isFetchingPbfts,
    isLoading: isLoadingPbfts,
  } = useGetPbftsByAddress(account);
  const {
    data: txData,
    isFetching: isFetchingTx,
    isLoading: isLoadingTx,
  } = useGetTransactionsByAddress(account);

  const {
    data: details,
    isFetching: isFetchingDetails,
    isLoading: isLoadingDetails,
  } = useGetDetailsForAddress(account);

  useEffect(() => {
    if (
      fetching ||
      isFetchingBlocks ||
      isLoadingBlocks ||
      isFetchingDags ||
      isLoadingDags ||
      isFetchingPbfts ||
      isLoadingPbfts ||
      isFetchingTx ||
      isLoadingTx ||
      isFetchingDetails ||
      isLoadingDetails
    ) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [
    fetching,
    isFetchingBlocks,
    isLoadingBlocks,
    isFetchingDags,
    isLoadingDags,
    isFetchingPbfts,
    isLoadingPbfts,
    isFetchingTx,
    isLoadingTx,
  ]);

  useEffect(() => {
    if (dagsData?.data) {
      setDagBlocks(dagsData?.data);
    }
  }, [dagsData]);

  useEffect(() => {
    if (pbftsData?.data) {
      setPbftBlocks(pbftsData?.data);
    }
  }, [pbftsData]);

  const formatToTransaction = (
    transactions: TransactionResponse[]
  ): Transaction[] => {
    return transactions.map((tx) => {
      return {
        hash: tx.hash,
        block: {
          number: tx.block,
          timestamp: tx.age,
        },
        value: ethers.BigNumber.from(tx.value),
        gasPrice: ethers.BigNumber.from(tx.gasPrice),
        gas: ethers.BigNumber.from(tx.gasUsed),
        status: tx.status,
        from: {
          address: tx.from,
        },
        to: {
          address: tx.to,
        },
      };
    });
  };

  useEffect(() => {
    if (txData?.data) {
      setTransactions(formatToTransaction(txData.data));
    }
  }, [txData]);

  const getFees = (transactions: TransactionResponse[], address: string) => {
    if (!transactions || !transactions?.length) {
      return 0;
    }
    const fromTransactions: TransactionResponse[] = transactions.filter(
      (tx: TransactionResponse) => tx.from === address
    );
    const sum = fromTransactions.reduce((accumulator: any, object) => {
      return Number(accumulator) + Number(object.gasUsed);
    }, 0);
    return sum;
  };

  useEffect(() => {
    const addressDetails: AddressInfoDetails = { ...addressInfoDetails };
    addressDetails.address = account;
    if (details?.data) {
      addressDetails.balance = ethers.utils.formatEther(
        ethers.BigNumber.from(details?.data.currentBalance)
      );
      addressDetails.value = details?.data.currentValue;
      addressDetails.valueCurrency = details?.data?.currency;
      addressDetails.totalReceived = ethers.utils.formatEther(
        ethers.BigNumber.from(details?.data.totalReceived)
      );
      addressDetails.totalSent = ethers.utils.formatEther(
        ethers.BigNumber.from(details?.data.totalSent)
      );
      addressDetails.pricePerTara = details?.data?.priceAtTimeOfCalculation;
    }
    if (data?.block) {
      addressDetails.address = data?.block?.account?.address;
    }
    if (nodeData?.data) {
      addressDetails.dagBlocks = nodeData?.data?.dags;
      addressDetails.pbftBlocks = nodeData?.data?.pbft;
    }
    if (txData?.data) {
      addressDetails.transactionCount = txData.data.length;
      addressDetails.fees = `${getFees(txData.data, account)}`;
    }
    setAddressInfoDetails(addressDetails);
  }, [details, data, nodeData, txData]);

  return { transactions, addressInfoDetails, dagBlocks, pbftBlocks };
};
