import axios from 'axios';
import {
  AddressDagsResponse,
  FetchWithPagination,
  ResultWithPagination,
} from '../types';

export const useGetDagsByAddress = (
  address: string
): ((
  endpoint: string,
  params: Partial<FetchWithPagination>
) => Promise<ResultWithPagination<AddressDagsResponse>>) => {
  return async (endpoint: string, params: Partial<FetchWithPagination>) => {
    if (!address || !endpoint) {
      return;
    }
    const url = `${endpoint}/address/${address}/dags`;
    const { data } = await axios.get(url, { params });
    return data;
  };
};
