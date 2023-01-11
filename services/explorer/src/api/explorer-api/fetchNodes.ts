import axios from 'axios';
import { useQuery } from 'react-query';
import { PaginationFilter, FetchWithPagination, NodesPaginate } from '../types';

const computeFilters = ({
  rowsPerPage,
  page,
}: FetchWithPagination): PaginationFilter => {
  const take = rowsPerPage;
  const skip = page * rowsPerPage;
  return {
    take,
    skip,
  };
};

const fetchNodes = async (endpoint: string, params: PaginationFilter) => {
  if (!endpoint) {
    return;
  }
  const url = `${endpoint}/nodes`;
  const { data } = await axios.get(url, { params });
  return data as NodesPaginate;
};

export const useGetNodes = (
  endpoint: string,
  params: FetchWithPagination
): {
  data: NodesPaginate;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['nodes', params],
    () => fetchNodes(endpoint, computeFilters(params)),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
      enabled: !!params,
    }
  );
  return {
    data,
    isError,
    error,
    isLoading,
    isFetching,
  };
};
