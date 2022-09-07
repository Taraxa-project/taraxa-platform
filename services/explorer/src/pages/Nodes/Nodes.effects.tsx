/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { ColumnData, NodesTableData } from '../../models/TableData';
import { useExplorerLoader } from '../../hooks/useLoader';
import { HashLink } from '../../components';
import { HashLinkType } from '../../utils';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'nodeAddress', name: 'Node Address' },
  { path: 'blocksProduced', name: '# blocks produced' },
];

const rows: NodesTableData[] = [
  {
    rank: 1,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 2,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 3,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 4,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 5,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 6,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 7,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 8,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 9,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 10,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 11,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 12,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 13,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
  {
    rank: 14,
    nodeAddress: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
    blocksProduced: 3213,
  },
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
  const [tableData, setTableData] = useState<NodesTableData[]>();

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
