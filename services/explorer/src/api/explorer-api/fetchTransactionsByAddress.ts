import axios from 'axios';
import { useQuery } from 'react-query';
import { API } from '../types';

const getByAddress = (address: string) => {
  if (!address) {
    return;
  }
  const url = `${API}/address/${address}/transactions`;
  // eslint-disable-next-line consistent-return
  return axios.get(url);
};

export const useGetTransactionsByAddress = (address: string) => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['transactions-by-address', address],
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
