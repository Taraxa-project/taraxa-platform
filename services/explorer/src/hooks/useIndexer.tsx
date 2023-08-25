import { useState } from 'react';
import { useQuery } from 'react-query';
import { FetchWithPagination, ResultWithPagination } from '../api';
import { useExplorerNetwork } from '../hooks';
import { usePagination } from '../hooks/usePagination';

export interface PaginationDataResults {
  data: any[];
  total: number;
  page: number;
  rowsPerPage: number;
  isLoading: boolean;
  error: any;
  handleChangePage: (p: number) => void;
  handleChangeRowsPerPage: (l: number) => void;
}

export const useIndexer = (
  queryData: {
    queryName: string;
    dependency?: string;
  },
  query: (
    endpoint: string,
    params: Partial<FetchWithPagination>
  ) => Promise<ResultWithPagination<any>>,
  disabled = false
): PaginationDataResults => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [start, setStart] = useState<number | null>(null);

  const { backendEndpoint } = useExplorerNetwork();
  const { handleChangeRowsPerPage, handleChangePage, rowsPerPage, page } =
    usePagination();

  const { isLoading, error } = useQuery(
    [queryData.queryName, page, rowsPerPage, queryData.dependency],
    async () => {
      const response = await query(backendEndpoint, {
        start,
        limit: rowsPerPage,
      });

      setData(response?.data ?? []);
      setTotal(response?.total ?? 0);
      return response;
    },
    { enabled: !disabled }
  );

  const onChangePage = (p: number) => {
    handleChangePage(p);
    setStart(p * rowsPerPage);
  };

  return {
    data,
    total,
    page,
    rowsPerPage,
    isLoading,
    error,
    handleChangePage: onChangePage,
    handleChangeRowsPerPage,
  };
};
