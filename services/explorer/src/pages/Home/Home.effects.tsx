import React, { useEffect, useState } from 'react';
import { useExplorerLoader } from '../../hooks/useLoader';
import { DagBlock, PbftBlock } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { timestampToAge } from '../../utils/TransactionRow';
import { HashLink } from '../../components';
import { HashLinkType } from '../../utils';
import { useNoteStateContext } from '../../hooks';
import { useBlocks, useDagBlocks } from '../../api';

export const useHomeEffects = () => {
  const { finalBlock } = useNoteStateContext();
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [dagBlocks, setDagBlocks] = useState<DagBlock[]>();
  const [pbftBlocks, setPbftBlocks] = useState<PbftBlock[]>();
  const blocksResult = useBlocks({
    from: finalBlock ? Number(finalBlock) - 9 : null,
    to: finalBlock ? Number(finalBlock) : null,
  });
  const dagBlocksResult = useDagBlocks({ count: 10, reverse: true });

  useEffect(() => {
    initLoading();
  }, []);

  useEffect(() => {
    Promise.all([blocksResult, dagBlocksResult])
      .then((values) => {
        if (values[0]) {
          const pbftBlocks: PbftBlock[] = values[0]?.data?.blocks;
          setPbftBlocks(pbftBlocks);
        }
        if (values[1]) {
          const dagBlocks: DagBlock[] = values[1]?.data?.dagBlocks;
          setDagBlocks(dagBlocks);
        }
        finishLoading();
      })
      .catch((err) => {
        finishLoading();
        // eslint-disable-next-line no-console
        console.log('Err: ', err);
      });
  }, [blocksResult, dagBlocksResult]);

  const dagToDisplay = (dagBlocks: DagBlock[]) => {
    const _tx = dagBlocks?.map((tx) => {
      return {
        level: tx.level?.toString(),
        hash: tx.hash,
        transactionCount: tx.transactions?.length,
        timeSince: timestampToAge(tx.timestamp.toString()),
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

  const pbftToDisplay = (pbftBlocks: PbftBlock[]) => {
    const _tx = pbftBlocks?.map((tx) => {
      return {
        level: tx.number?.toString(),
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
