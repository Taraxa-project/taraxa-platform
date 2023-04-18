import { useCallback, useMemo } from 'react';

import { Validator, ValidatorWithStats } from '../interfaces/Validator';
import { networks } from '../utils/networks';
import useApi from './useApi';
import useMainnet from './useMainnet';

export default () => {
  const { get } = useApi();
  const { chainId } = useMainnet();

  const updateValidatorsStats = useCallback(
    async (validators: Validator[]): Promise<ValidatorWithStats[]> => {
      if (validators.length === 0) {
        return [] as ValidatorWithStats[];
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const stats = await get(
            `${networks[chainId].indexerUrl}/address/${validator.address.toLowerCase()}/stats`,
          );

          if (!stats.success || !stats.response.lastPbftTimestamp) {
            return {
              ...validator,
              pbftsProduced: 0,
              isActive: false,
            } as ValidatorWithStats;
          }
          const lastBlockTimestamp = stats.response.lastPbftTimestamp;
          const lastBlockDate = new Date(lastBlockTimestamp * 1000);
          const diff = new Date().getTime() - lastBlockDate.getTime();
          const diffHours = diff / 1000 / 60 / 60;
          return {
            ...validator,
            pbftsProduced: stats.response.pbftCount,
            isActive: diffHours < 24,
          } as ValidatorWithStats;
        }),
      );

      return newValidators;
    },
    [get],
  );

  const updateValidatorsRank = useCallback(
    async (validators: Validator[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const ranking = await get(
            `${networks[chainId].indexerUrl}/validators/${validator.address.toLowerCase()}`,
          );

          if (!ranking.success) {
            return validator;
          }
          const { rank } = ranking.response;
          return {
            ...validator,
            rank,
          };
        }),
      );

      return newValidators;
    },
    [get],
  );

  return useMemo(
    () => ({
      updateValidatorsStats,
      updateValidatorsRank,
    }),
    [updateValidatorsStats, updateValidatorsRank],
  );
};
