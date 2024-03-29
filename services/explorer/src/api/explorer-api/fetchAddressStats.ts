import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

const getAddressStats = (endpoint: string, address: string) => {
  if (!address || !endpoint) {
    return;
  }
  const url = `${endpoint}/address/${address}/stats`;
  // eslint-disable-next-line consistent-return
  return axios.get(url);
};

export const useGetAddressStats = (
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
    ['address-stats', address, endpoint],
    () => getAddressStats(endpoint, address),
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
