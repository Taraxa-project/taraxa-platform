import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

const getGenesisBlock = (endpoint: string) => {
  if (!endpoint) {
    return;
  }
  const url = `${endpoint}/pbft/genesis`;
  return axios.get(url);
};

export const useGetGenesisBlock = (
  endpoint: string,
  enabled: boolean
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['genesis-block', endpoint],
    () => getGenesisBlock(endpoint),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
      enabled,
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
