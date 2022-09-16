/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { useExplorerLoader } from '../../hooks/useLoader';
import { DagBlock, PbftBlock } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { timestampToAge } from '../../utils/TransactionRow';
import { HashLink } from '../../components';
import { HashLinkType } from '../../utils';
import { useNoteStateContext } from '../../hooks';
import { blocksQuery, dagBlocksQuery } from '../../api';

export const useHomeEffects = () => {
  const { finalBlock } = useNoteStateContext();
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [dagBlocks, setDagBlocks] = useState<DagBlock[]>();
  const [pbftBlocks, setPbftBlocks] = useState<PbftBlock[]>();

  const [{ fetching: fetchingBlocks, data: blocksData }] = useQuery({
    query: blocksQuery,
    variables: {
      from: finalBlock ? finalBlock - 9 : null,
      to: finalBlock || null,
    },
  });

  const [{ fetching: fetchingDagBlocks, data: dagBlocksData }] = useQuery({
    query: dagBlocksQuery,
    variables: {
      count: 10,
      reverse: true,
    },
  });

  useEffect(() => {
    if (fetchingBlocks || fetchingDagBlocks) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetchingBlocks, fetchingDagBlocks]);

  useEffect(() => {
    if (blocksData?.blocks) {
      setPbftBlocks(blocksData?.blocks);
    }
  }, [blocksData]);

  useEffect(() => {
    if (dagBlocksData?.dagBlocks) {
      setDagBlocks(dagBlocksData?.dagBlocks);
    }
  }, [dagBlocksData]);

  const dagToDisplay = (dagBlocks: DagBlock[]) => {
    const _tx = dagBlocks?.map((tx) => {
      return {
        level: tx.level?.toString(),
        hash: tx.hash,
        transactionCount: tx.transactionCount,
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
        blockNumber: tx.number?.toString(),
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
