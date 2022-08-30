import { useEffect, useState } from 'react';
import { BlockData } from '../../models/TableData';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';

const transactions: BlockData[] = [
  {
    level: '525299',
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionCount: 3,
    timestamp: '1661776098',
  },
  {
    level: '525299',
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionCount: 33,
    timestamp: '1661776098',
  },
  {
    level: '525299',
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionCount: 23,
    timestamp: '1661776098',
  },
  {
    level: '525299',
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionCount: 13,
    timestamp: '1661776098',
  },
  {
    level: '525299',
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionCount: 9,
    timestamp: '1661776098',
  },
  {
    level: '525299',
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionCount: 7,
    timestamp: '1661776098',
  },
];

export const useHomeEffects = () => {
  const { currentNetwork } = useExplorerNetwork();
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>();
  const [pbftBlocks, setPbftBlocks] = useState<BlockData[]>();

  useEffect(() => {
    setDagBlocks(transactions);
    setPbftBlocks(transactions);
  }, [currentNetwork]);

  return { currentNetwork, dagBlocks, pbftBlocks };
};
