import axios from 'axios';
import { useQuery } from 'react-query';
import { API } from './types';

const getBlocksNumber = () => {
  const url = `${API}/pbft/total-this-week`;
  return axios.get(url);
};

export const useGetBlocksThisWeek = () => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['pbgt-blocks-this-week'],
    () => getBlocksNumber(),
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
