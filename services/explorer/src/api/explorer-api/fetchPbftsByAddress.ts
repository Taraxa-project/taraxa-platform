import axios from 'axios';
import {
  AddressPbftsResponse,
  FetchWithPagination,
  ResultWithPagination,
} from '../types';

export const useGetPbftsByAddress = (
  address: string
): ((
  endpoint: string,
  params: Partial<FetchWithPagination>
) => Promise<ResultWithPagination<AddressPbftsResponse>>) => {
  return async (endpoint: string, params: Partial<FetchWithPagination>) => {
    if (!address || !endpoint) {
      return;
    }
    const url = `${endpoint}/address/${address}/pbfts`;
    const { data } = await axios.get(url, { params });
    return data;
  };
};
