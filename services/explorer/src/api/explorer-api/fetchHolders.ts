import axios from 'axios';
import {
  FetchWithPagination,
  HoldersResponse,
  NodesResultWithPagination,
} from '../types';

export const useGetHolders = async (
  endpoint: string,
  params: Partial<FetchWithPagination>
): Promise<NodesResultWithPagination<HoldersResponse>> => {
  const url = `${endpoint}/holders`;
  const response = await axios.get(url, {
    params: {
      ...params,
    },
  });
  return response.data;
};
