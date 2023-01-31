import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { TOKEN_PRICE_API_ENDPOINT } from './types';

const getTokenPrice = () => {
  return axios.get(TOKEN_PRICE_API_ENDPOINT);
};

export const useGetTokenPrice = (): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['token-price'],
    () => getTokenPrice(),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
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
