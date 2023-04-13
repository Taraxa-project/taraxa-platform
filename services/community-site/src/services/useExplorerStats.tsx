import { useCallback, useMemo } from 'react';

import { Validator, ValidatorStatus } from '../interfaces/Validator';
import { networks } from '../utils/networks';
import useApi from './useApi';
import useMainnet from './useMainnet';
import useValidators from './useValidators';

export default () => {
  const { get } = useApi();
  const { chainId } = useMainnet();
  const { isValidatorEligible } = useValidators();

  const updateValidatorsStats = useCallback(
    async (validators: Validator[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const stats = await get(
            `${networks[chainId].indexerUrl}/address/${validator.address.toLowerCase()}/stats`,
          );

          if (!stats.success) {
            return validator;
          }

          const lastBlockTimestamp = stats.response.lastPbftTimestamp;
          if (!lastBlockTimestamp) {
            return validator;
          }
          const lastBlockDate = new Date(lastBlockTimestamp * 1000);
          const diff = new Date().getTime() - lastBlockDate.getTime();
          const diffHours = diff / 1000 / 60 / 60;
          const producedBlocksInLast24hours = diffHours < 24;
          const isEligible = await isValidatorEligible(validator.address);
          const validatorStatus = isEligible
            ? producedBlocksInLast24hours
              ? ValidatorStatus.Green
              : ValidatorStatus.Yellow
            : ValidatorStatus.Grey;

          return {
            ...validator,
            isActive: producedBlocksInLast24hours,
            status: validatorStatus,
          };
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
