import axios from 'axios';
import {
  FetchWithPagination,
  HoldersResponse,
  NodesResultWithPagination,
} from '../types';

export const useGetHolders = async (
  endpoint: string,
  params: FetchWithPagination
): Promise<NodesResultWithPagination<HoldersResponse>> => {
  const maxResults = 2000;
  let { start, limit } = params;
  if (start + limit > maxResults) {
    start = Math.max(0, maxResults - limit);
    limit = Math.min(limit, maxResults - start);
  }
  const url = `${endpoint}/holders`;
  const response = await axios.get(url, {
    params: {
      start: start || 0,
      limit: limit || 25,
    },
  });
  const data = response.data;

  if (data.total > maxResults) {
    data.total = maxResults;
  }
  return response.data;
};
