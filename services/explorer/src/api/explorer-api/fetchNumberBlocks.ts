import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

const getBlocksNumber = (endpoint: string) => {
  if (!endpoint) {
    return;
  }
  const url = `${endpoint}/pbft/total-this-week`;
  return axios.get(url);
};

export const useGetBlocksThisWeek = (
  endpoint: string
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['pbft-blocks-this-week'],
    () => getBlocksNumber(endpoint),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
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
