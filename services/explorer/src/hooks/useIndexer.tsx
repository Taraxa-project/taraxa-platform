import { useCallback, useEffect, useState } from 'react';
import { FetchWithPagination, ResultWithPagination } from '../api';
import { useExplorerNetwork } from '../hooks';
import { usePagination } from '../hooks/usePagination';

export const useIndexer = (
  query: (
    endpoint: string,
    params: Partial<FetchWithPagination>
  ) => Promise<ResultWithPagination<any>>,
  disabled = false
): {
  data: any[];
  total: number;
  page: number;
  rowsPerPage: number;
  handleChangePage: (p: number) => void;
  handleChangeRowsPerPage: (l: number) => void;
} => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [start, setStart] = useState<number | null>(null);

  const { backendEndpoint } = useExplorerNetwork();
  const { handleChangeRowsPerPage, handleChangePage, rowsPerPage, page } =
    usePagination();

  const getData = useCallback(async () => {
    const response = await query(backendEndpoint, {
      start,
      limit: rowsPerPage,
    });

    setData(response?.data);
    setTotal(response?.total);
  }, [start, rowsPerPage]);

  useEffect(() => {
    if (!disabled) {
      getData();
    }
  }, [getData, disabled, page, rowsPerPage]);

  const onChangePage = (p: number) => {
    handleChangePage(p);
    setStart(total - p * rowsPerPage);
  };

  return {
    data,
    total,
    page,
    rowsPerPage,
    handleChangePage: onChangePage,
    handleChangeRowsPerPage,
  };
};
