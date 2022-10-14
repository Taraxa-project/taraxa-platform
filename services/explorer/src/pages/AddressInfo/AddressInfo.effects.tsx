import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { ethers } from 'ethers';
import { accountQuery } from '../../api/graphql/queries/account';
import {
  getMockedDagBlocks,
  getMockedTransactions,
  getMockPbftBlocks,
} from '../../api/mocks';
import { useExplorerLoader } from '../../hooks/useLoader';
import { AddressInfoDetails, BlockData, Transaction } from '../../models';
import { useGetBlocksByAddress } from '../../api';

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
    isFetching,
    isLoading,
  } = useGetBlocksByAddress(account);

  useEffect(() => {
    if (fetching || isFetching || isLoading) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching, isFetching, isLoading]);

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
        dagBlocks: addressInfoDetails.dagBlocks || 0,
        pbftBlocks: addressInfoDetails.pbftBlocks || 0,
      };
      setAddressInfoDetails(details);
    }
  }, [data]);

  useEffect(() => {
    initLoading();
    const transactions: Transaction[] = getMockedTransactions(account);
    const dagBlocks: BlockData[] = getMockedDagBlocks(account);
    const pbftBlocks: BlockData[] = getMockPbftBlocks(account);
    setTimeout(() => {
      setTransactions(transactions);
      setDagBlocks(dagBlocks);
      setPbftBlocks(pbftBlocks);
      finishLoading();
    }, 1500);
  }, []);

  return { transactions, addressInfoDetails, dagBlocks, pbftBlocks };
};
