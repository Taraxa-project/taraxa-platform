import { BlockCardProps } from '@taraxa_project/taraxa-ui/src/components/BlockCard';
import { useEffect, useState } from 'react';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';

const transactions = [
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
];

export const useHomeEffects = () => {
  const { currentNetwork } = useExplorerNetwork();
  const [dagBlocks, setDagBlocks] = useState<BlockCardProps>();
  const [pbftBlocks, setPbftBlocks] = useState<BlockCardProps>();

  useEffect(() => {
    setDagBlocks({
      title: 'DAG Blocks',
      transactions,
    });
    setPbftBlocks({
      title: 'PBFT Blocks',
      transactions,
    });
  }, []);

  return { currentNetwork, dagBlocks, pbftBlocks };
};
