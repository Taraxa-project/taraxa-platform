import { useCallback, useMemo } from 'react';
import { BigNumber } from 'ethers';

import { Validator, ValidatorStatus, ValidatorType } from '../interfaces/Validator';
import { networks } from '../utils/networks';
import useApi from './useApi';
import useMainnet from './useMainnet';
import { useValidatorsWeeklyStats } from './useValidatorsWeeklyStats';

const MIN_DELEGATION_THRESHOLD = BigNumber.from('500000').mul(
  BigNumber.from('10').pow(BigNumber.from('18')),
);

export default () => {
  const { get } = useApi();
  const { chainId } = useMainnet();
  const { validatorWeekStats, getPbftBlocksProduced } = useValidatorsWeeklyStats();

  const getStats = async (validator: Validator, chain: number) => {
    const stats = await get(
      `${networks[chain].indexerUrl}/address/${validator.address.toLowerCase()}/stats`,
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

    if (validator.type === ValidatorType.MAINNET) {
      const isEligible = validator.delegation.gte(MIN_DELEGATION_THRESHOLD);

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

  const updateValidatorsStats = useCallback(
    async (validators: Validator[]): Promise<Validator[]> => {
      if (validators.length === 0) {
        return [] as Validator[];
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const validatorWithStats = await getStats(validator, chainId);
          const pbftsProduced = getPbftBlocksProduced(validatorWithStats.address);
          return {
            ...validatorWithStats,
            pbftsProduced,
          };
        }),
      );
      return newValidators as Validator[];
    },
    [get, validatorWeekStats, getPbftBlocksProduced],
  );

  const updateTestnetValidatorsStats = useCallback(
    async (validators: Validator[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          return getStats(validator, 842);
        }),
      );

      return newValidators as Validator[];
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

          const { rank, registrationBlock } = ranking.response;
          const percentage = Number.parseFloat(ranking.response.yield || 0) * 100;

          return {
            ...validator,
            rank,
            registrationBlock,
            yield: Number(percentage.toFixed(2)),
          };
        }),
      );

      return newValidators;
    },
    [get],
  );

  const updateTestnetValidatorsRank = useCallback(
    async (validators: Validator[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const ranking = await get(
            `${networks[842].indexerUrl}/validators/${validator.address.toLowerCase()}`,
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
