/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { ColumnData, NodesTableData } from '../../models';
import { useExplorerLoader } from '../../hooks/useLoader';
import { RankedNode, useGetBlocksThisWeek, useGetNodes } from '../../api';
import { useExplorerNetwork } from 'src/hooks';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'nodeAddress', name: 'Node Address' },
  { path: 'blocksProduced', name: '# blocks produced' },
];

export const useNodesEffects = () => {
  const { initLoading, finishLoading } = useExplorerLoader();
  const { backendEndpoint, currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);

  const [weekNumber, setWeekNumber] = useState<number>(
    DateTime.now().weekNumber
  );
  const [year, setYear] = useState<number>(DateTime.now().year);

  const monday = DateTime.fromObject({
    weekNumber: weekNumber,
    weekYear: year,
  })
    .startOf('week')
    .toFormat('LLL dd');
  const sunday = DateTime.fromObject({
    weekNumber: weekNumber,
    weekYear: year,
  })
    .endOf('week')
    .toFormat('LLL dd');
  const title = `Top nodes for Week ${weekNumber} ${year}`;
  const subtitle = `Top block producers for Week ${weekNumber} (${monday} - ${sunday})`;
  const description = 'Total blocks produced this week';

  const [tableData, setTableData] = useState<NodesTableData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [blocks, setBlocks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const {
    data: nodesResult,
    isFetching,
    isLoading,
  } = useGetNodes(backendEndpoint, { rowsPerPage, page }, weekNumber, year);
  const {
    data: totalBlocks,
    isFetching: isFetchingTotalBlocks,
    isLoading: isLoadingTotalBlocks,
  } = useGetBlocksThisWeek(backendEndpoint, weekNumber, year);

  const handlePreviousWeek = () => {
    clearNodes();
    if (weekNumber === 1) {
      setYear((year) => year - 1);
      setWeekNumber(DateTime.utc(year - 1, 12, 28).weekNumber);
    } else {
      setWeekNumber((weekNumber) => weekNumber - 1);
    }
  };

  const handleNextWeek = () => {
    clearNodes();
    const lastWeekOfYear = DateTime.utc(year, 12, 28).weekNumber;
    if (weekNumber === lastWeekOfYear) {
      if (year < DateTime.now().year) {
        setYear((year) => year + 1);
        setWeekNumber(1);
      }
    } else if (weekNumber < lastWeekOfYear) {
      setWeekNumber((weekNumber) => weekNumber + 1);
    }
  };

  const formatNodesToTable = (nodes: RankedNode[]): NodesTableData[] => {
    if (nodes?.length === 0) {
      return [];
    }
    const formattedNodes: NodesTableData[] = nodes?.map(
      (node: RankedNode, i: number) => {
        return {
          rank: tableData?.length > 0 ? tableData.length + i + 1 : i + 1,
          nodeAddress: node?.address,
          blocksProduced: node?.pbftCount,
        };
      }
    );
    return formattedNodes;
  };

  const clearNodes = () => {
    setBlocks(0);
    setTotalCount(0);
    setTableData([]);
    setPage(0);
  };

  useEffect(() => {
    if (
      isFetching ||
      isLoading ||
      isFetchingTotalBlocks ||
      isLoadingTotalBlocks
    ) {
      initLoading();
      setLoading(true);
    } else {
      finishLoading();
      setLoading(false);
    }
  }, [isFetching, isLoading, isFetchingTotalBlocks, isLoadingTotalBlocks]);

  useEffect(() => {
    if (nodesResult?.data && nodesResult?.total) {
      setTableData(
        tableData.concat(formatNodesToTable(nodesResult.data as RankedNode[]))
      );
      setTotalCount(Number(nodesResult?.total));
    }
  }, [nodesResult]);

  useEffect(() => {
    if (totalBlocks?.data && !isNaN(totalBlocks?.data)) {
      setBlocks(totalBlocks.data);
    }
  }, [totalBlocks]);

  useEffect(() => {
    if (currentNetwork !== network) {
      window.location.reload();
    }
  }, [currentNetwork, network]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return {
    blocks,
    title,
    subtitle,
    description,
    cols,
    tableData,
    totalCount,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePreviousWeek,
    handleNextWeek,
    weekNumber,
    year,
    loading,
  };
};
