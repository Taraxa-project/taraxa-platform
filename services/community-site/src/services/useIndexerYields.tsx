import { useCallback, useMemo } from 'react';
import useApi from './useApi';

export type YieldResponse = {
  fromBlock: number;
  toBlock: number;
  yield: number;
};

export default () => {
  const { get } = useApi();

  const indexerUrl = `${process.env.REACT_APP_INDEXER_API_HOST}`;

  const getYieldForAddress = useCallback(
    async (address: string): Promise<YieldResponse> => {
      const url = `${indexerUrl}/address/${address.toLowerCase()}/yield`;
      const response = await get(url);
      if (!response.success) {
        return {} as YieldResponse;
      }
      const percentage = Number.parseFloat(response.response.yield || 0) * 100;
      return {
        ...response.response,
        yield: percentage.toFixed(2),
      } as YieldResponse;
    },
    [get, indexerUrl],
  );

  return useMemo(() => ({ getYieldForAddress }), [getYieldForAddress]);
};
