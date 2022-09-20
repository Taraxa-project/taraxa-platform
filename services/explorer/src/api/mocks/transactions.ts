import { Transaction, TransactionData, TransactionStatus } from '../../models';

export const getMockedTransactions = (txHash: string): Transaction[] => {
  const transactions: Transaction[] = [
    {
      hash: txHash,
      nonce: 2221,
      index: 44421,
      status: 1,
      value: 1000000,
      block: {
        timestamp: '1661776098',
        hash: txHash,
        number: 7414,
      },
      from: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      to: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      gas: 21000,
      gasPrice: 3100,
      gasUsed: 1111,
      inputData: 2131123132312,
      cumulativeGasUsed: 2222,
    },
    {
      hash: txHash,
      nonce: 2221,
      index: 44421,
      status: 1,
      value: 1000000,
      block: {
        timestamp: '1661776098',
        hash: txHash,
        number: 7414,
      },
      from: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      to: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      gas: 21000,
      gasPrice: 3100,
      gasUsed: 1111,
      inputData: 2131123132312,
      cumulativeGasUsed: 2222,
    },
    {
      hash: txHash,
      nonce: 2221,
      index: 44421,
      status: 1,
      value: 1000000,
      block: {
        timestamp: '1661776098',
        hash: txHash,
        number: 7414,
      },
      from: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      to: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      gas: 21000,
      gasPrice: 3100,
      gasUsed: 1111,
      inputData: 2131123132312,
      cumulativeGasUsed: 2222,
    },
    {
      hash: txHash,
      nonce: 2221,
      index: 44421,
      status: 1,
      value: 1000000,
      block: {
        timestamp: '1661776098',
        hash: txHash,
        number: 7414,
      },
      from: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      to: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      gas: 21000,
      gasPrice: 3100,
      gasUsed: 1111,
      inputData: 2131123132312,
      cumulativeGasUsed: 2222,
    },
    {
      hash: txHash,
      nonce: 2221,
      index: 44421,
      status: 1,
      value: 1000000,
      block: {
        timestamp: '1661776098',
        hash: txHash,
        number: 7414,
      },
      from: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      to: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      gas: 21000,
      gasPrice: 3100,
      gasUsed: 1111,
      inputData: 2131123132312,
      cumulativeGasUsed: 2222,
    },
    {
      hash: txHash,
      nonce: 2221,
      index: 44421,
      status: 1,
      value: 1000000,
      block: {
        timestamp: '1661776098',
        hash: txHash,
        number: 7414,
      },
      from: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      to: {
        address:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        balance: 10000001,
        code: 2332,
        transactionCount: 21,
      },
      gas: 21000,
      gasPrice: 3100,
      gasUsed: 1111,
      inputData: 2131123132312,
      cumulativeGasUsed: 2222,
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
    block: 7417,
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
    token: 'TARA',
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
