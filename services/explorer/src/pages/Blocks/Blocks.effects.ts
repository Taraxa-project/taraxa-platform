import { useEffect, useState } from 'react';
import { useExplorerLoader } from '../../hooks/useLoader';
import { BlockData, ColumnData } from '../../models';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { getMockedBlocksColsAndRows } from '../../api/mocks';

export const useBlockEffects = () => {
  const [data, setData] = useState<BlockData[]>();
  const { cols, rows } = getMockedBlocksColsAndRows();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columns, setColumns] = useState<ColumnData[]>(cols);
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();

  useEffect(() => {
    initLoading();
    setTimeout(() => {
      setData(rows);
      finishLoading();
    }, 1500);
  }, []);

  return { data, columns, currentNetwork };
};
