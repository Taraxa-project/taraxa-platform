import { useCallback, useMemo } from 'react';
import { networks } from '@taraxa_project/taraxa-sdk';
import useApi from './useApi';
import useMainnet from './useMainnet';

export type YieldResponse = {
  fromBlock: number;
  toBlock: number;
  yield: number;
};

export default () => {
  const { get } = useApi();
  const { chainId } = useMainnet();
  const indexerUrl = `${networks[chainId].indexerUrl}`;

  const getYieldForAddress = useCallback(
    async (address: string, blockNum?: number): Promise<YieldResponse> => {
      const url = blockNum
        ? `${indexerUrl}/address/${address.toLowerCase()}/yield?blockNumber=${blockNum}`
        : `${indexerUrl}/address/${address.toLowerCase()}/yield`;
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

  const getHistoricalYieldForAddress = useCallback(
    async (address: string, noOfPeriods = 5) => {
      let blockNum;
      const yields: YieldResponse[] = [];
      for (let i = 0; i < noOfPeriods; i++) {
        const yieldResponse: YieldResponse = await getYieldForAddress(address, blockNum);
        if (!yieldResponse || !yieldResponse.yield) {
          break;
        }
        blockNum = yieldResponse.fromBlock - 1;
        yields.push(yieldResponse);
      }
      return yields;
    },
    [getYieldForAddress],
  );

  return useMemo(
    () => ({ getYieldForAddress, getHistoricalYieldForAddress }),
    [getYieldForAddress, getHistoricalYieldForAddress],
  );
};
