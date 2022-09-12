import { useEffect, useState } from 'react';
import { getMockedDagTable } from '../../api/mocks';
import { useExplorerLoader } from '../../hooks/useLoader';
import { BlockData } from '../../models';

export const useDagEffects = () => {
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>([]);
  const { initLoading, finishLoading } = useExplorerLoader();

  useEffect(() => {
    const dagBlocks: BlockData[] = getMockedDagTable();
    initLoading();
    setTimeout(() => {
      setDagBlocks(dagBlocks);
      finishLoading();
    }, 3000);
  }, []);

  return {
    dagBlocks,
  };
};
