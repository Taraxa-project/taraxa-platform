import axios from 'axios';

export const useGetTotalSupply = async (endpoint: string): Promise<string> => {
  const url = `${endpoint}/totalSupply`;
  const response = await axios.get(url);
  return response.data;
};
