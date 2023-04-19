import { useCallback, useMemo } from 'react';

import { Validator, ValidatorStatus, ValidatorWithStats } from '../interfaces/Validator';
import { networks } from '../utils/networks';
import useApi from './useApi';
import useMainnet from './useMainnet';
import useValidators from './useValidators';
import OwnNode from '../interfaces/OwnNode';

export default () => {
  const { get } = useApi();
  const { chainId } = useMainnet();
  const { isValidatorEligible } = useValidators();

  const getStats = async (validator: Validator | OwnNode, type: 'mainnet' | 'testnet') => {
    const stats = await get(
      `${networks[chainId].indexerUrl}/address/${validator.address.toLowerCase()}/stats`,
    );

    if (!stats.success) {
      return {
        ...validator,
        isActive: false,
        status: ValidatorStatus.NOT_ELIGIBLE,
      };
    }

    const lastBlockTimestamp = stats.response.lastPbftTimestamp;
    if (!lastBlockTimestamp) {
      return {
        ...validator,
        isActive: false,
        status: ValidatorStatus.NOT_ELIGIBLE,
      };
    }

    const lastBlockDate = new Date(lastBlockTimestamp * 1000);
    const diff = new Date().getTime() - lastBlockDate.getTime();
    const diffHours = diff / 1000 / 60 / 60;
    const producedBlocksInLast24hours = diffHours < 24;

    let validatorStatus: ValidatorStatus;

    if (type === 'mainnet') {
      const isEligible = await isValidatorEligible(validator.address);
      validatorStatus = isEligible
        ? producedBlocksInLast24hours
          ? ValidatorStatus.ELIGIBLE
          : ValidatorStatus.ELIGIBLE_INACTIVE
        : ValidatorStatus.NOT_ELIGIBLE;
    } else {
      validatorStatus = producedBlocksInLast24hours
        ? ValidatorStatus.ELIGIBLE
        : ValidatorStatus.NOT_ELIGIBLE;
    }

    return {
      ...validator,
      isActive: producedBlocksInLast24hours,
      status: validatorStatus,
    };
  };

  const fetchValidatorStatsForWeek = useCallback(async (): Promise<
    { address: string; pbftCount: number; rank: number }[]
  > => {
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
    return validatorStats;
  }, []);

  const updateValidatorsStats = useCallback(
    async (validators: Validator[]): Promise<ValidatorWithStats[]> => {
      if (validators.length === 0) {
        return [] as ValidatorWithStats[];
      }

      let newValidators = await Promise.all(
        validators.map(async (validator) => {
          return getStats(validator, 'mainnet');
        }),
      );
      const validatorStats = await fetchValidatorStatsForWeek();
      newValidators = newValidators.map((validator) => {
        return {
          ...validator,
          pbftsProduced:
            validatorStats.find(
              (stat) => stat.address.toLowerCase() === validator.address.toLowerCase(),
            )?.pbftCount || 0,
        };
      });
      return newValidators as ValidatorWithStats[];
    },
    [get],
  );

  const updateTestnetValidatorsStats = useCallback(
    async (validators: OwnNode[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          return getStats(validator, 'testnet');
        }),
      );

      return newValidators as OwnNode[];
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

  const updateTestnetValidatorsRank = useCallback(
    async (validators: OwnNode[]) => {
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
      updateTestnetValidatorsStats,
      updateTestnetValidatorsRank,
    }),
    [
      updateValidatorsStats,
      updateValidatorsRank,
      updateTestnetValidatorsStats,
      updateTestnetValidatorsRank,
    ],
  );
};
