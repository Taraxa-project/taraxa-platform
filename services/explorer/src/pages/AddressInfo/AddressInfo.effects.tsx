import { useCallback, useEffect, useState } from 'react';
import { AddressInfoProps } from '../../components';
import { TransactionDataItem } from '../../components/AddressInfo/AddressInfoTable';
import { TransactionStatus } from '../../models/TableData';

const blockData: TransactionDataItem[] = Array(20).fill({
  txHash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
  status: TransactionStatus.SUCCESS,
  timestamp: '1661776098',
  pbftBlock: '529133',
  dagLevel: '529133',
  dagHash: '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
  value: '1000000',
  from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
  gasLimit: '210000',
  gas: '0.21000',
  gasPrice: '3100',
  to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
  nonce: 153,
});

export const useAddressInfoEffects = () => {
  const [transactions, setTransactions] = useState<TransactionDataItem[]>();
  const [addressInfoDetails, setAddressInfoDetails] =
    useState<Omit<AddressInfoProps, 'blockData'>>();

  const fetchAddressInfoDetails = useCallback(() => {
    setTimeout(() => {
      const addressInfoProps: Omit<AddressInfoProps, 'blockData'> = {
        address: '0xc6a808A6EC3103548f0b38d32DCb6a705B700ACDE',
        balance: '123',
        value: '123',
        transactionCount: 240,
        totalReceived: '2123',
        totalSent: '123',
        fees: '123',
        dagBlocks: 123,
        pbftBlocks: 123,
      };
      setAddressInfoDetails(addressInfoProps);
    }, 500);
  }, []);

  useEffect(() => {
    setTransactions(blockData);
  }, []);

  useEffect(() => {
    fetchAddressInfoDetails();
  }, []);

  return { transactions, addressInfoDetails };
};
