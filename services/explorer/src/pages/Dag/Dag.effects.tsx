/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { DagBlockFilters, dagBlocksQuery } from '../../api';
import {
  useExplorerLoader,
  useExplorerNetwork,
  useNodeStateContext,
} from '../../hooks';
import { BlockData, ColumnData, DagBlock, DagTableRow } from '../../models';
import { toDagBlockTableRow } from '../../utils';

export const useDagEffects = () => {
  const { dagBlockLevel } = useNodeStateContext();
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
  const [rows, setRows] = useState<{ data: DagTableRow[] }[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const { initLoading, finishLoading } = useExplorerLoader();

  const columns: ColumnData[] = [
    { path: 'timestamp', name: 'Timestamp' },
    { path: 'level', name: 'Level' },
    { path: 'hash', name: 'Block Hash' },
    { path: 'transactionCount', name: 'Transactions' },
  ];

  const [blocksFilters, setBlocksFilter] = useState<DagBlockFilters>({
    dagLevel: null,
    count: rowsPerPage || 25,
    reverse: true,
  });

  const [{ fetching, data: dagBlocksData }] = useQuery({
    query: dagBlocksQuery,
    variables: blocksFilters,
    pause: !blocksFilters || !blocksFilters.dagLevel,
  });

  const handleChangePage = (newPage: number) => {
    setBlocksFilter({
      dagLevel: blocksFilters.dagLevel - (rowsPerPage || 25),
      count: rowsPerPage || 25,
      reverse: true,
    });
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setBlocksFilter({
      dagLevel: dagBlockLevel,
      count: rowsPerPage || 25,
      reverse: true,
    });
  };

  const formatBlocksToTable = (
    blocks: DagBlock[]
  ): { data: DagTableRow[] }[] => {
    if (!blocks?.length) {
      return [];
    }
    const formattedBlocks: BlockData[] = blocks
      .map((block: DagBlock) => {
        return {
          timestamp: block.timestamp,
          level: block.level,
          hash: block.hash,
          transactionCount: block.transactionCount,
        };
      })
      .sort((a, b) => b.level - a.level);
    return formattedBlocks.map((block) => toDagBlockTableRow(block));
  };

  useEffect(() => {
    if (dagBlockLevel) {
      setBlocksFilter({
        dagLevel: dagBlockLevel,
        count: rowsPerPage || 25,
        reverse: true,
      });
    }
  }, [dagBlockLevel]);

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching]);

  useEffect(() => {
    if (dagBlocksData?.dagBlocks) {
      setRows(rows.concat(formatBlocksToTable(dagBlocksData.dagBlocks)));
    }
  }, [dagBlocksData]);

  useEffect(() => {
    if (currentNetwork !== network) {
      setRows([]);
    }
  }, [currentNetwork, network]);

  return {
    columns,
    rows,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount: dagBlockLevel,
  };
};
