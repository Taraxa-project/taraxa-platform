import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

/**
 * Endpoint: /transaction/{hash} to fetch the decoded transaction data.
 * @Note THIS ENDPOINT RETURNS 404 IF THE TRANSACTION IS NOT DECODED IN THE INDEXER
 * @param endpoint
 * @param hash
 * @returns
 */
const getDecodedTrans = (endpoint: string, hash: string) => {
  if (!hash || !endpoint) {
    return;
  }
  const url = `${endpoint}/transaction/${hash}`;
  return axios.get(url);
};

export const useGetDecodedTransactionsByTxHash = (
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
    ['decoded-transactions', hash, endpoint],
    () => getDecodedTrans(endpoint, hash),
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
