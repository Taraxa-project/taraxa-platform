import { useCallback, useEffect, useState } from 'react';
import {
  getMockedAddresInfoDetails,
  getMockedDagBlocks,
  getMockedTransactions,
  getMockPbftBlocks,
} from '../../api/mocks';
import { AddressInfoDetails, BlockData, TransactionData } from '../../models';

export const useAddressInfoEffects = (txHash: string) => {
  const [transactions, setTransactions] = useState<TransactionData[]>();
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>();
  const [pbftBlocks, setPbftBlocks] = useState<BlockData[]>();
  const [addressInfoDetails, setAddressInfoDetails] =
    useState<AddressInfoDetails>();

  const fetchAddressInfoDetails = useCallback(() => {
    setTimeout(() => {
      const addressInfoProps: AddressInfoDetails = getMockedAddresInfoDetails();
      setAddressInfoDetails(addressInfoProps);
    }, 500);
  }, []);

  useEffect(() => {
    const transactions: TransactionData[] = getMockedTransactions(txHash);
    const dagBlocks: BlockData[] = getMockedDagBlocks(txHash);
    const pbftBlocks: BlockData[] = getMockPbftBlocks(txHash);
    setTransactions(transactions);
    setDagBlocks(dagBlocks);
    setPbftBlocks(pbftBlocks);
  }, []);

  useEffect(() => {
    fetchAddressInfoDetails();
  }, []);

  return { transactions, addressInfoDetails, dagBlocks, pbftBlocks };
};
