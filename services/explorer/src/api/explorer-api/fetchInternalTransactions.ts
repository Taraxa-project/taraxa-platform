import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

const getInternalTrans = (endpoint: string, hash: string) => {
  if (!hash || !endpoint) {
    return;
  }
  const url = `${endpoint}/transaction/${hash}/internal_transactions`;
  return axios.get(url);
};

export const useGetInternalTransactionsByTxHash = (
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
    ['internal-transactions', address, endpoint],
    () => getInternalTrans(endpoint, address),
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
