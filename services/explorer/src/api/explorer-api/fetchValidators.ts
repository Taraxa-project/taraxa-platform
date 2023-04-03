import axios from 'axios';
import {
  AddressTxResponse,
  FetchWithPagination,
  NodesResultWithPagination,
} from '../types';

export const useGetValidators = async (
  endpoint: string,
  week: number,
  year: number,
  params: Partial<FetchWithPagination>
): Promise<NodesResultWithPagination<AddressTxResponse>> => {
  const url = `${endpoint}/validators`;
  const response = await axios.get(url, {
    params: {
      ...params,
      week,
      year,
    },
  });
  return response.data;
};
