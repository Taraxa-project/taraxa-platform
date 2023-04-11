/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import {
  useExplorerLoader,
  useNodeStateContext,
  useExplorerNetwork,
} from '../../hooks';
import { BlockData, ColumnData, PbftBlock, PbftTableRow } from '../../models';
import { blocksQuery, PbftBlocksFilters } from '../../api';
import { toBlockTableRow } from '../../utils';

export const useBlockEffects = () => {
  const { finalBlock } = useNodeStateContext();
  const [rows, setRows] = useState<{ data: PbftTableRow[] }[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
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

  const formatBlocksToTable = (
    blocks: PbftBlock[]
  ): { data: PbftTableRow[] }[] => {
    if (!blocks?.length) {
      return [];
    }
    let formattedBlocks: BlockData[] = [];
    formattedBlocks = blocks
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
    return formattedBlocks.map((block) => toBlockTableRow(block));
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
      setRows(rows.concat(formatBlocksToTable(blocksData.blocks)));
    }
  }, [blocksData]);

  useEffect(() => {
    if (currentNetwork !== network) {
      setRows([]);
    }
  }, [currentNetwork, network]);

  useEffect(() => {
    if (finalBlock) {
      setBlocksFilter({ from: finalBlock, to: finalBlock - (rowsPerPage - 1) });
    }
  }, [finalBlock]);

  return {
    rows,
    columns,
    currentNetwork,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount: finalBlock,
  };
};
