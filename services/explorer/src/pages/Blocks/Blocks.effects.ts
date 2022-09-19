/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { useExplorerLoader } from '../../hooks/useLoader';
import { BlockData, ColumnData, PbftBlock } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { blocksQuery, PbftBlocksFilters } from '../../api';
import { useNoteStateContext } from '../../hooks';

export const useBlockEffects = () => {
  const { finalBlock } = useNoteStateContext();
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
  });

  const handleChangePage = (newPage: number) => {
    setBlocksFilter({
      from: blocksFilters.to - 1,
      to: blocksFilters.to - 1 - (rowsPerPage - 1),
    });
    console.log('New page: ', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log('Rows per page changed');
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setBlocksFilter({ from: finalBlock, to: finalBlock - (rowsPerPage - 1) });
  };

  const formatBlocksToTable = (blocks: PbftBlock[]): BlockData[] => {
    if (!blocks?.length) {
      return [];
    }
    const formmatedBlocks: BlockData[] = blocks
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
    return formmatedBlocks;
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
