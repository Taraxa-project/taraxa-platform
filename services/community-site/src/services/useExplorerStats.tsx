import { useCallback, useMemo } from 'react';

import { Validator, ValidatorStatus, ValidatorWithStats } from '../interfaces/Validator';
import { networks } from '../utils/networks';
import useApi from './useApi';
import useMainnet from './useMainnet';
import useValidators from './useValidators';
import OwnNode from '../interfaces/OwnNode';
import { useValidatorsWeeklyStats } from './useValidatorsWeeklyStats';

export default () => {
  const { get } = useApi();
  const { chainId } = useMainnet();
  const { isValidatorEligible } = useValidators();
  const { validatorWeekStats, getPbftBlocksProduced } = useValidatorsWeeklyStats();

  const getStats = async (
    validator: Validator | OwnNode,
    type: 'mainnet' | 'testnet',
    chain: number,
  ) => {
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

  const updateValidatorsStats = useCallback(
    async (validators: Validator[]): Promise<ValidatorWithStats[]> => {
      if (validators.length === 0) {
        return [] as ValidatorWithStats[];
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const validatorWithStats = await getStats(validator, 'mainnet', chainId);
          const pbftsProduced = getPbftBlocksProduced(validatorWithStats.address);
          return {
            ...validatorWithStats,
            pbftsProduced,
          };
        }),
      );
      return newValidators as ValidatorWithStats[];
    },
    [get, validatorWeekStats],
  );

  const updateTestnetValidatorsStats = useCallback(
    async (validators: OwnNode[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          return getStats(validator, 'testnet', 842);
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
