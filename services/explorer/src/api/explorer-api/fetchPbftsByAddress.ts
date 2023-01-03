import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { API } from '../../index';

const getByAddress = (address: string) => {
  if (!address) {
    return;
  }
  const url = `${API}/address/${address}/pbfts`;
  // eslint-disable-next-line consistent-return
  return axios.get(url);
};

export const useGetPbftsByAddress = (
  address: string
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['pbfts-by-address', address],
    () => getByAddress(address),
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
