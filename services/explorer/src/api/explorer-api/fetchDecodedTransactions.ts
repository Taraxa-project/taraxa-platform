import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { TransactionType } from 'src/utils';

const getDecodedTrans = (endpoint: string, hash: string) => {
  if (!hash || !endpoint) {
    return;
  }
  const url = `${endpoint}/transaction/${hash}`;
  return axios.get(url);
};

export const useGetDecodedTransactionsByTxHash = (
  endpoint: string,
  txType: TransactionType,
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
    () => getDecodedTrans(endpoint, hash),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
      enabled:
        !!hash &&
        !!txType &&
        txType !== TransactionType.Internal_Transfer &&
        txType !== TransactionType.Transfer,
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
