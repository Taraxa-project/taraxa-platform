import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

const getByAddress = (endpoint: string, address: string) => {
  if (!address) {
    return;
  }
  const url = `${endpoint}/address/${address}/dags`;
  // eslint-disable-next-line consistent-return
  return axios.get(url);
};

export const useGetDagsByAddress = (
  endpoint: string,
  address: string
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['dags-by-address', address],
    () => getByAddress(endpoint, address),
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
