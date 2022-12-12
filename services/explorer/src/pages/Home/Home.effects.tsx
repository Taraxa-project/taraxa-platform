/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { useExplorerLoader } from '../../hooks/useLoader';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { timestampToAge } from '../../utils/TransactionRow';
import { HashLink } from '../../components';
import { HashLinkType } from '../../utils';
import { useNodeStateContext } from '../../hooks';
import {
  blocksQuery,
  dagBlocksForPeriodQuery,
  dagBlocksQuery,
} from '../../api';
import { DagBlock, PbftBlock } from '../../models';

export const useHomeEffects = () => {
  const { finalBlock, dagBlockPeriod } = useNodeStateContext();
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [dagBlocks, setDagBlocks] = useState<DagBlock[]>();
  const [pbftBlocks, setPbftBlocks] = useState<PbftBlock[]>();
  const [currentPeriod, setCurrentPeriod] = useState(dagBlockPeriod);
  const [dagsForLastTenPeriods, setDagsForLastTenPeriods] = useState<
    DagBlock[]
  >([]);

  const [{ fetching: fetchingBlocks, data: blocksData }] = useQuery({
    query: blocksQuery,
    variables: {
      from: finalBlock ? finalBlock - 9 : null,
      to: finalBlock || null,
    },
    pause: !finalBlock,
  });

  const [{ fetching: fetchingDagBlocks, data: dagBlocksData }] = useQuery({
    query: dagBlocksQuery,
    variables: {
      count: 100,
      reverse: true,
    },
  });

  const [
    { fetching: fetchingDagBlocksForLastFivePeriods, data: dagsForLastPeriod },
  ] = useQuery({
    query: dagBlocksForPeriodQuery,
    variables: {
      period: currentPeriod,
    },
    pause: !currentPeriod,
  });

  useEffect(() => {
    setCurrentPeriod(dagBlockPeriod);
  }, [dagBlockPeriod]);

  useEffect(() => {
    if (
      fetchingBlocks ||
      fetchingDagBlocks ||
      fetchingDagBlocksForLastFivePeriods
    ) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetchingBlocks, fetchingDagBlocks, fetchingDagBlocksForLastFivePeriods]);

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

  useEffect(() => {
    if (dagsForLastPeriod?.periodDagBlocks) {
      setDagsForLastTenPeriods([
        ...dagsForLastTenPeriods,
        ...dagsForLastPeriod.periodDagBlocks,
      ]);
      if (dagBlockPeriod - currentPeriod < 9)
        setCurrentPeriod(currentPeriod - 1);
    }
  }, [dagsForLastPeriod]);

  const dagToDisplay = (dagBlocks: DagBlock[]) => {
    const _tx = dagBlocks?.map((tx) => {
      return {
        level: tx.level?.toString(),
        hash: tx.hash,
        transactionCount: tx.transactionCount,
        timeSince: timestampToAge(tx.timestamp),
        hashElement: (
          <HashLink
            width='auto'
            linkType={HashLinkType.BLOCKS}
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
          <HashLink width='auto' linkType={HashLinkType.PBFT} hash={tx.hash} />
        ),
      };
    });
    return {
      title: 'PBFT Blocks',
      transactions: _tx,
    };
  };

  return {
    currentNetwork,
    dagBlocks,
    pbftBlocks,
    dagsForLastTenPeriods,
    dagToDisplay,
    pbftToDisplay,
  };
};
