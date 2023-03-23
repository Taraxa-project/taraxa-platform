import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

const getBlocksNumber = (endpoint: string, week: number, year: number) => {
  if (!endpoint || !week || !year) {
    return;
  }
  const url = `${endpoint}/validators/total`;
  const params = {
    week,
    year,
  };
  return axios.get(url, { params });
};

export const useGetBlocksThisWeek = (
  endpoint: string,
  week: number,
  year: number
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['pbft-blocks-this-week', endpoint, week, year],
    () => getBlocksNumber(endpoint, week, year),
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
