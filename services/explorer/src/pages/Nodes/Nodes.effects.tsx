/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { NodesTableData } from '../../models';
import { useExplorerLoader } from '../../hooks/useLoader';
import { HashLink } from '../../components';
import { HashLinkType } from '../../utils';
import { getMockedNodesColsAndRows } from '../../api/mocks';

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
  const [tableData, setTableData] = useState<NodesTableData[]>();

  const { cols, rows } = getMockedNodesColsAndRows();

  const formatTableData = (
    rows: NodesTableData[]
  ): {
    data: {
      rank: number;
      nodeAddress: JSX.Element;
      blocksProduced: string;
    }[];
  }[] => {
    if (!rows?.length) {
      return [];
    }
    return rows.map((row) => {
      return {
        data: [
          {
            rank: row.rank,
            nodeAddress: (
              <HashLink
                linkType={HashLinkType.ADDRESSES}
                width='auto'
                hash={row.nodeAddress}
              />
            ),
            blocksProduced: row.blocksProduced.toLocaleString('en-US'),
          },
        ],
      };
    });
  };

  useEffect(() => {
    initLoading();
    setTimeout(() => {
      setTableData(rows);
      finishLoading();
    }, 3000);
  }, []);

  return {
    blocks,
    title,
    subtitle,
    description,
    cols,
    tableData,
    formatTableData,
  };
};
