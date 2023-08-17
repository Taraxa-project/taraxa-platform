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
  hash: string
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['internal-transactions', hash, endpoint],
    () => getInternalTrans(endpoint, hash),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
      enabled: !!hash,
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
