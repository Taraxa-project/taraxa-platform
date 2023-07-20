import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

const getDecodedEvents = (endpoint: string, hash: string) => {
  if (!hash || !endpoint) {
    return;
  }
  const url = `${endpoint}/transaction/${hash}/logs`;
  return axios.get(url);
};

export const useGetDecodedLogsByTxHash = (
  endpoint: string,
  hasLogs: boolean,
  hash: string
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['decoded-events', hash, endpoint, hasLogs],
    () => getDecodedEvents(endpoint, hash),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
      enabled: !!hash && hasLogs,
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
