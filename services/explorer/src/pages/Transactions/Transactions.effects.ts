import { useEffect, useState } from 'react';
import {
  ColumnData,
  TransactionTableData,
  TransactionStatus,
} from '../../models/TableData';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';

const cols = [
  { path: 'timestamp', name: 'Timestamp' },
  { path: 'block', name: 'Block' },
  { path: 'status', name: 'Status' },
  { path: 'txHash', name: 'TxHash' },
  { path: 'value', name: 'Value' },
];

const rows = [
  {
    timestamp: '1661429700',
    block: '529133',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '0.00000023',
    token: 'TARA',
  },
  {
    timestamp: '1661429100',
    block: '529131',
    status: TransactionStatus.FAILURE,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '0.0023',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
  {
    timestamp: '1661429710',
    block: '529134',
    status: TransactionStatus.SUCCESS,
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '23',
    token: 'TARA',
  },
];

export const useTransactionEffects = () => {
  const [data, setData] = useState<TransactionTableData[]>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columns, setColumns] = useState<ColumnData[]>(cols);
  const { currentNetwork } = useExplorerNetwork();

  useEffect(() => {
    setTimeout(() => {
      setData(rows);
    }, 3000);
  }, [data]);

  return { data, columns, currentNetwork };
};
