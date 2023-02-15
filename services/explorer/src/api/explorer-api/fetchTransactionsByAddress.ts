import axios from 'axios';
import { useQuery } from 'react-query';
import { TxPaginate, FetchWithPagination, PaginationFilter } from '../types';

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
  const url = `${endpoint}/address/${address}/transactions`;
  const { data } = await axios.get(url, { params });
  return data as TxPaginate;
};

export const useGetTransactionsByAddress = (
  endpoint: string,
  address: string,
  params: FetchWithPagination
): {
  data: TxPaginate;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['transactions-by-address', address, endpoint, params],
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
