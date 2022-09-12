import { ColumnData, NodesTableData } from '../../models';

export const getMockedNodesColsAndRows = () => {
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
  return { cols, rows };
};
