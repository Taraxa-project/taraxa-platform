import { BlockData, BlockDetails } from '../../models';

export const getMockedDagBlocks = (dagLevel: string): BlockData[] => {
  const dag: BlockData[] = Array(20).fill({
    timestamp: 1661776098,
    block: dagLevel,
    level: '23213123213',
    hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 105,
  });
  return dag;
};

export const getMockedDagTable = (): BlockData[] => {
  const dag: BlockData[] = Array(20).fill({
    timestamp: 1661776098,
    level: '23213123213',
    hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    transactionCount: 105,
  });
  return dag;
};

export const getMockPbftBlocks = (dagLevel: string): BlockData[] => {
  const pbft: BlockData[] = Array(20).fill({
    timestamp: 1661416098,
    block: dagLevel,
    level: '123512312',
    hash: '0x00e193a15486909eba3fb36c855cb8a331180bc97a27hfb69b8122de02e5ea18',
    transactionCount: 21,
  });
  return pbft;
};

export const getMockedBlockDetails = (txHash: string): BlockDetails => {
  const blockDetails: BlockDetails = {
    timestamp: 1661858931,
    block: '529133',
    hash: txHash,
    transactionCount: 72,
    period: '11923',
    pivot: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    sender: '0xc6a808A6EC3103548f0b38d32DCb6a705B700ACDE',
    signature:
      '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea180x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
    verifiableDelay: 443,
  };
  return blockDetails;
};

export const getMockedBlocksColsAndRows = () => {
  const cols = [
    { path: 'timestamp', name: 'Age' },
    { path: 'block', name: 'Block' },
    { path: 'hash', name: 'Tx Hash' },
    { path: 'transactionCount', name: 'Transactions' },
  ];

  const rows = [
    {
      timestamp: Date.now(),
      block: '529133',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661416929,
      block: '529131',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 70,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 79,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 101,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 109,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 55,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
    {
      timestamp: 1661429710,
      block: '529134',
      hash: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
      transactionCount: 72,
    },
  ];

  return { cols, rows };
};

export const getMockedDagBlocksCard = () => {
  const blockData: BlockData[] = [
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 3,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 33,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 23,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 13,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 9,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 7,
      timestamp: 1661776098,
    },
  ];
  return blockData;
};

export const getMockedPbftBlocksCard = () => {
  const blockData: BlockData[] = [
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 3,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 33,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 23,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 13,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 9,
      timestamp: 1661776098,
    },
    {
      level: 525299,
      hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
      transactionCount: 7,
      timestamp: 1661776098,
    },
  ];
  return blockData;
};
