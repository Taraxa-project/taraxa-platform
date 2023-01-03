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
  const { backendEndpoint } = useExplorerNetwork();

  const weekNo = DateTime.now().weekNumber;
  const year = DateTime.now().year;
  const monday = DateTime.now().startOf('week').toFormat('LLL dd');
  const sunday = DateTime.now().endOf('week').toFormat('LLL dd');
  const title = `Top nodes for Week ${weekNo} ${year}`;
  const subtitle = `Top block producers for Week ${weekNo} (${monday} - ${sunday})`;
  const description = 'Total blocks produced this week';

  const [tableData, setTableData] = useState<NodesTableData[]>([]);
  const [totalCount, setTotalCount] = useState<number>();
  const [blocks, setBlocks] = useState<number>(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = React.useState(0);
  const {
    data: nodesResult,
    isFetching,
    isLoading,
  } = useGetNodes(backendEndpoint, { rowsPerPage, page });
  const {
    data: totalBlocks,
    isFetching: isFetchingTotalBlocks,
    isLoading: isLoadingTotalBlocks,
  } = useGetBlocksThisWeek(backendEndpoint);

  const formatNodesToTable = (nodes: RankedNode[]): NodesTableData[] => {
    if (!nodes?.length) {
      return [];
    }
    const formattedNodes: NodesTableData[] = nodes.map(
      (node: RankedNode, i: number) => {
        return {
          rank: tableData?.length > 0 ? tableData.length + i + 1 : i + 1,
          nodeAddress: node.address,
          blocksProduced: node.pbftCount,
        };
      }
    );
    return formattedNodes;
  };

  useEffect(() => {
    if (
      isFetching ||
      isLoading ||
      isFetchingTotalBlocks ||
      isLoadingTotalBlocks
    ) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [isFetching, isLoading, isFetchingTotalBlocks, isLoadingTotalBlocks]);

  useEffect(() => {
    if (nodesResult?.data && nodesResult?.total) {
      setTableData(
        tableData.concat(formatNodesToTable(nodesResult.data as RankedNode[]))
      );
      setTotalCount(nodesResult?.total);
    }
  }, [nodesResult]);

  useEffect(() => {
    if (totalBlocks?.data) {
      setBlocks(totalBlocks.data);
    }
  }, [totalBlocks]);

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
  };
};
