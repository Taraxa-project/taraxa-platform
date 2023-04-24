import React, { useState, useContext, createContext, useEffect, useCallback } from 'react';
import { networks } from '../utils/networks';
import useApi from './useApi';
import useMainnet from './useMainnet';

export type ValidatorStats = { address: string; pbftCount: number; rank: number };

type Context = {
  validatorWeekStats: ValidatorStats[];
  getPbftBlocksProduced: (address: string) => number;
};

const initialState: Context = {
  validatorWeekStats: [],
  getPbftBlocksProduced: () => {
    return 0;
  },
};

const ValdiatorWeeklyStatsContext = createContext<Context>(initialState);

const useProvideValidatorWeeklyStats = () => {
  const [validatorWeekStats, setValidatorWeekStats] = useState<ValidatorStats[]>([]);
  const { get } = useApi();
  const { chainId } = useMainnet();

  const fetchValidatorStatsForWeek = useCallback(async (): Promise<void> => {
    let validatorStats: { address: string; pbftCount: number; rank: number }[] = [];
    let start = 0;
    let hasNextPage = true;
    while (hasNextPage) {
      try {
        const allValidators = await get(
          `${networks[chainId].indexerUrl}/validators?limit=100&start=${start}`,
        );
        if (allValidators.success) {
          validatorStats = [...validatorStats, ...allValidators.response.data];
          hasNextPage = allValidators.response.hasNext;
          start += 100;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        hasNextPage = false;
      }
    }
    setValidatorWeekStats(validatorStats);
  }, []);

  const getPbftBlocksProduced = (address: string) => {
    const pbftsProduced =
      validatorWeekStats.find((stat) => stat.address.toLowerCase() === address.toLowerCase())
        ?.pbftCount || 0;

    return pbftsProduced;
  };

  useEffect(() => {
    (async () => {
      await fetchValidatorStatsForWeek();
    })();
  }, [fetchValidatorStatsForWeek]);

  return {
    validatorWeekStats,
    getPbftBlocksProduced,
  };
};

export const ValidatorWeeklyStatsProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useProvideValidatorWeeklyStats();

  return (
    <ValdiatorWeeklyStatsContext.Provider value={value}>
      {children}
    </ValdiatorWeeklyStatsContext.Provider>
  );
};

export const useValidatorsWeeklyStats = () => {
  return useContext(ValdiatorWeeklyStatsContext);
};
