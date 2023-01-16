import axios from 'axios';
import { useQuery } from 'react-query';
import { DagsPaginate, FetchWithPagination, PaginationFilter } from '../types';

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

const getByAddress = async (
  endpoint: string,
  address: string,
  params: PaginationFilter
) => {
  if (!address || !endpoint) {
    return;
  }
  const url = `${endpoint}/address/${address}/dags`;
  const { data } = await axios.get(url, { params });
  return data as DagsPaginate;
};

export const useGetDagsByAddress = (
  endpoint: string,
  address: string,
  params: FetchWithPagination
): {
  data: DagsPaginate;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['dags-by-address', address, params],
    () => getByAddress(endpoint, address, computeFilters(params)),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
      enabled: !!address,
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
