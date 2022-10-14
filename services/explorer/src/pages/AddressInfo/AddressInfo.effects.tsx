import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { ethers } from 'ethers';
import { accountQuery } from '../../api/graphql/queries/account';
import { useExplorerLoader } from '../../hooks/useLoader';
import { AddressInfoDetails, BlockData, Transaction } from '../../models';
import {
  useGetBlocksByAddress,
  useGetDagsByAddress,
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

export const useAddressInfoEffects = (account: string) => {
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
      isLoadingTx
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
    if (nodeData?.data) {
      setAddressInfoDetails({
        ...addressInfoDetails,
        dagBlocks: nodeData?.data?.dags,
        pbftBlocks: nodeData?.data?.pbft,
      });
    }
  }, [nodeData]);

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
      setTransactions(formatToTransaction(txData?.data));
    }
  }, [txData]);

  useEffect(() => {
    if (data?.block) {
      const details: AddressInfoDetails = {
        address: data?.block?.account?.address,
        balance: ethers.BigNumber.from(
          data?.block?.account?.balance
        ).toString(),
        value: `${ethers.BigNumber.from(
          data?.block?.account?.balance
        ).toString()} TARA`,
        transactionCount: data?.block?.account?.transactionCount,
        totalReceived: '10000 (mocked)',
        totalSent: '10000 (mocked)',
        fees: '15 (mocked)',
        dagBlocks: addressInfoDetails?.dagBlocks || 0,
        pbftBlocks: addressInfoDetails?.pbftBlocks || 0,
      };
      setAddressInfoDetails(details);
    }
  }, [data]);

  return { transactions, addressInfoDetails, dagBlocks, pbftBlocks };
};
