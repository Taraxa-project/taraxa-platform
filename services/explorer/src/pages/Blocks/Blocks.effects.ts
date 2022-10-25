import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import {
  useExplorerLoader,
  useNodeStateContext,
  useExplorerNetwork,
} from '../../hooks';
import { BlockData, ColumnData, PbftBlock } from '../../models';
import { blocksQuery, PbftBlocksFilters } from '../../api';

export const useBlockEffects = () => {
  const { finalBlock } = useNodeStateContext();
  const [data, setData] = useState<BlockData[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();

  const columns: ColumnData[] = [
    { path: 'timestamp', name: 'Age' },
    { path: 'block', name: 'Block' },
    { path: 'hash', name: 'Tx Hash' },
    { path: 'transactionCount', name: 'Transactions' },
  ];

  const [blocksFilters, setBlocksFilter] = useState<PbftBlocksFilters>({
    from: 0,
  });

  const [{ fetching, data: blocksData }] = useQuery({
    query: blocksQuery,
    variables: blocksFilters,
    pause: !blocksFilters || !blocksFilters?.from || !blocksFilters?.to,
  });

  const handleChangePage = (newPage: number) => {
    setBlocksFilter({
      from: blocksFilters.to - 1,
      to: blocksFilters.to - 1 - (rowsPerPage - 1),
    });
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setBlocksFilter({ from: finalBlock, to: finalBlock - (rowsPerPage - 1) });
  };

  const formatBlocksToTable = (blocks: PbftBlock[]): BlockData[] => {
    if (!blocks?.length) {
      return [];
    }
    const formattedBlocks: BlockData[] = blocks
      .map((block: PbftBlock) => {
        return {
          timestamp: block.timestamp,
          block: block.number,
          level: block.number,
          hash: block.hash,
          transactionCount: block.transactionCount,
        };
      })
      .sort((a, b) => b.block - a.block);
    return formattedBlocks;
  };

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching]);

  useEffect(() => {
    if (blocksData?.blocks) {
      setData(data.concat(formatBlocksToTable(blocksData?.blocks)));
    }
  }, [blocksData]);

  useEffect(() => {
    if (finalBlock) {
      setBlocksFilter({ from: finalBlock, to: finalBlock - (rowsPerPage - 1) });
    }
  }, [finalBlock]);

  return {
    data,
    columns,
    currentNetwork,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount: finalBlock,
  };
};
