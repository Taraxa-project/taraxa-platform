import axios from 'axios';
import { useQuery } from 'react-query';
import {
  API,
  FetchNodesFilter,
  FetchNodesPagination,
  NodesPaginate,
} from '../types';

const computeFilters = ({
  rowsPerPage,
  page,
}: FetchNodesPagination): FetchNodesFilter => {
  const take = rowsPerPage;
  const skip = page * rowsPerPage;
  return {
    take,
    skip,
  };
};

const fetchNodes = async (params: FetchNodesFilter) => {
  const url = `${API}/nodes`;
  const { data } = await axios.get(url, { params });
  return data as NodesPaginate;
};

export const useGetNodes = (
  params: FetchNodesPagination
): {
  data: NodesPaginate;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['nodes', params],
    () => fetchNodes(computeFilters(params)),
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
