import { useEffect, useState } from 'react';
import { BlockData, ColumnData } from '../../models/TableData';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';

const cols = [
  { path: 'timestamp', name: 'Age' },
  { path: 'block', name: 'Block' },
  { path: 'txHash', name: 'Tx Hash' },
  { path: 'transactionCount', name: 'Transactions' },
];

const rows = [
  {
    timestamp: `${Date.now()}`,
    block: '529133',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661416929',
    block: '529131',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 70,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 79,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 101,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 109,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 55,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
  {
    timestamp: '1661429710',
    block: '529134',
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 72,
  },
];

export const useBlockEffects = () => {
  const [data, setData] = useState<BlockData[]>();
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
