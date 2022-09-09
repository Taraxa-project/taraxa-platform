import { useEffect, useState } from 'react';
import { useExplorerLoader } from '../../hooks/useLoader';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { ColumnData, TransactionTableData } from '../../models';
import { getMockedTransactionColsAndRows } from '../../api/mocks';

export const useTransactionEffects = () => {
  const [data, setData] = useState<TransactionTableData[]>();
  const { cols, rows } = getMockedTransactionColsAndRows();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columns, setColumns] = useState<ColumnData[]>(cols);
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();

  useEffect(() => {
    initLoading();
    setTimeout(() => {
      setData(rows);
      finishLoading();
    }, 3000);
  }, []);

  return { data, columns, currentNetwork };
};
