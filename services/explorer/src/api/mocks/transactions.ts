import { TransactionData, TransactionStatus } from '../../models';

export const getMockedTransactions = (txHash: string): TransactionData[] => {
  const transactions: TransactionData[] = [
    {
      txHash:
        '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      status: TransactionStatus.SUCCESS,
      timestamp: '1661776098',
      pbftBlock: txHash,
      dagLevel: '529133',
      dagHash:
        '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      value: '1000000',
      from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      gasLimit: '210000',
      gas: '21000',
      gasPrice: '3100',
      nonce: 244411,
    },
    {
      txHash:
        '0x11e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      status: TransactionStatus.SUCCESS,
      timestamp: '1661776098',
      pbftBlock:
        '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      dagLevel: '529133',
      dagHash: txHash,
      value: '1000000',
      from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      gasLimit: '210000',
      gas: '21000',
      gasPrice: '3100',
      nonce: 244411,
    },
    {
      txHash:
        '0x44e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      status: TransactionStatus.SUCCESS,
      timestamp: '1661776098',
      pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
      dagLevel: '529133',
      dagHash: txHash,
      value: '1000000',
      from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      gasLimit: '210000',
      gas: '21000',
      gasPrice: '3100',
      nonce: 244411,
    },
    {
      txHash:
        '0x55e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      status: TransactionStatus.FAILURE,
      timestamp: '1661776098',
      pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
      dagLevel: '529133',
      dagHash:
        '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      value: '1000000',
      from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      gasLimit: '210000',
      gas: '21000',
      gasPrice: '3100',
      nonce: 244411,
    },
    {
      txHash:
        '0x99e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      status: TransactionStatus.SUCCESS,
      timestamp: '1661776098',
      pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
      dagLevel: '529133',
      dagHash:
        '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      value: '1000000',
      from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      gasLimit: '210000',
      gas: '21000',
      gasPrice: '3100',
      nonce: 244411,
    },
    {
      txHash:
        '0x99e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      status: TransactionStatus.SUCCESS,
      timestamp: '1661776098',
      pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
      dagLevel: '529133',
      dagHash:
        '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      value: '1000000',
      from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      gasLimit: '210000',
      gas: '21000',
      gasPrice: '3100',
      nonce: 244411,
    },
  ];

  return transactions;
};

export const getMockedCurrentTransaction = (): TransactionData => {
  const txData: TransactionData = {
    txHash:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    status: TransactionStatus.SUCCESS,
    timestamp: '1661776098',
    pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    dagLevel: '529133',
    dagHash:
      '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    value: '1000000',
    from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    gasLimit: '210000',
    gas: '21000',
    gasPrice: '3100',
    nonce: 244411,
  };
  return txData;
};

export const getMockedTransactionColsAndRows = () => {
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

  return { cols, rows };
};
