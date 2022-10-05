/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { ColumnData, NodesTableData } from '../../models';
import { useExplorerLoader } from '../../hooks/useLoader';
import { RankedNode, useGetNodes } from '../../api';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'nodeAddress', name: 'Node Address' },
  { path: 'blocksProduced', name: '# blocks produced' },
];

export const useNodesEffects = () => {
  const { initLoading, finishLoading } = useExplorerLoader();
  const blocks = 3214; // We will get this from GraphQL
  const weekNo = 8; // We will get this from GraphQL
  const now = moment();
  const monday = now.clone().weekday(1).format('MMM DD');
  const sunday = now.clone().weekday(7).format('MMM DD');
  const year = now.clone().year();
  const title = `Top nodes for Week ${weekNo} ${year}`;
  const subtitle = `Top block producers for Week ${weekNo} (${monday} - ${sunday})`;
  const description = 'Total blocks produced this week';
  const [tableData, setTableData] = useState<NodesTableData[]>([]);
  const [totalCount, setTotalCount] = useState<number>();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = React.useState(0);
  const {
    data: nodesResult,
    isFetching,
    isLoading,
  } = useGetNodes({ rowsPerPage, page });

  const formatNodesToTable = (nodes: RankedNode[]): NodesTableData[] => {
    if (!nodes?.length) {
      return [];
    }
    const formattedNodes: NodesTableData[] = nodes.map((node: RankedNode) => {
      return {
        rank: node.id,
        nodeAddress: node.address,
        blocksProduced: node.pbftCount,
      };
    });
    return formattedNodes;
  };

  useEffect(() => {
    if (isFetching || isLoading) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [isFetching, isLoading]);

  useEffect(() => {
    if (nodesResult?.data && nodesResult?.total) {
      console.log('nodesResult.data: ', nodesResult.data);
      setTableData(
        tableData.concat(formatNodesToTable(nodesResult.data as RankedNode[]))
      );
      setTotalCount(nodesResult?.total);
    }
  }, [nodesResult]);

  const handleChangePage = (newPage: number) => {
    console.log('New page: ', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log('Rows per page changed');
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
