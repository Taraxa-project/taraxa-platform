import { useCallback, useEffect, useState } from 'react';
import {
  getMockedAddresInfoDetails,
  getMockedDagBlocks,
  getMockedTransactions,
  getMockPbftBlocks,
} from '../../api/mocks';
import { useExplorerLoader } from '../../hooks/useLoader';
import { AddressInfoDetails, BlockData, TransactionData } from '../../models';

export const useAddressInfoEffects = (txHash: string) => {
  const [transactions, setTransactions] = useState<TransactionData[]>();
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>();
  const [pbftBlocks, setPbftBlocks] = useState<BlockData[]>();
  const [addressInfoDetails, setAddressInfoDetails] =
    useState<AddressInfoDetails>();
  const { initLoading, finishLoading } = useExplorerLoader();

  const fetchAddressInfoDetails = useCallback(() => {
    setTimeout(() => {
      const addressInfoProps: AddressInfoDetails = getMockedAddresInfoDetails();
      setAddressInfoDetails(addressInfoProps);
    }, 500);
  }, []);

  useEffect(() => {
    initLoading();
    const transactions: TransactionData[] = getMockedTransactions(txHash);
    const dagBlocks: BlockData[] = getMockedDagBlocks(txHash);
    const pbftBlocks: BlockData[] = getMockPbftBlocks(txHash);
    setTimeout(() => {
      fetchAddressInfoDetails();
      setTransactions(transactions);
      setDagBlocks(dagBlocks);
      setPbftBlocks(pbftBlocks);
      finishLoading();
    }, 1500);
  }, []);

  return { transactions, addressInfoDetails, dagBlocks, pbftBlocks };
};
