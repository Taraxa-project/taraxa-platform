import React, { useEffect, useState } from 'react';
import { useExplorerLoader } from '../../hooks/useLoader';
import { BlockData } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { timestampToAge } from '../../utils/TransactionRow';
import { HashLink } from '../../components';
import { HashLinkType } from '../../utils';
import {
  getMockedDagBlocksCard,
  getMockedPbftBlocksCard,
} from '../../api/mocks';

export const useHomeEffects = () => {
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>();
  const [pbftBlocks, setPbftBlocks] = useState<BlockData[]>();

  useEffect(() => {
    initLoading();
    setTimeout(() => {
      setDagBlocks(getMockedDagBlocksCard());
      setPbftBlocks(getMockedPbftBlocksCard());
      finishLoading();
    }, 1500);
  }, [currentNetwork]);

  const dagToDisplay = (dagBlocks: BlockData[]) => {
    const _tx = dagBlocks?.map((tx) => {
      return {
        level: tx.level,
        hash: tx.hash,
        transactionCount: tx.transactionCount,
        timeSince: timestampToAge(tx.timestamp),
        hashElement: (
          <HashLink
            width='auto'
            linkType={HashLinkType.TRANSACTIONS}
            hash={tx.hash}
          />
        ),
      };
    });
    return {
      title: 'DAG Blocks',
      transactions: _tx,
    };
  };

  const pbftToDisplay = (pbftBlocks: BlockData[]) => {
    const _tx = pbftBlocks?.map((tx) => {
      return {
        level: tx.level,
        hash: tx.hash,
        transactionCount: tx.transactionCount,
        timeSince: timestampToAge(tx.timestamp),
        hashElement: (
          <HashLink
            width='auto'
            linkType={HashLinkType.TRANSACTIONS}
            hash={tx.hash}
          />
        ),
      };
    });
    return {
      title: 'PBFT Blocks',
      transactions: _tx,
    };
  };

  return { currentNetwork, dagBlocks, pbftBlocks, dagToDisplay, pbftToDisplay };
};
