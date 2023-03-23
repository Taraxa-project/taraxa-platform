import { useCallback, useMemo } from 'react';

import { Validator } from '../interfaces/Validator';
import useApi from './useApi';

export default () => {
  const { get } = useApi();

  const updateValidatorsStats = useCallback(
    async (validators: Validator[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const status = await get(
            `https://indexer.mainnet.taraxa.io/address/${validator.address.toLowerCase()}/stats`,
          );
          if (!status.success) {
            return validator;
          }
          const lastBlockTimestamp = status.response.lastDagTimestamp;
          if (!lastBlockTimestamp) {
            return validator;
          }
          const lastBlockDate = new Date(lastBlockTimestamp * 1000);
          const diff = new Date().getTime() - lastBlockDate.getTime();
          const diffHours = diff / 1000 / 60 / 60;
          return {
            ...validator,
            isActive: diffHours < 24,
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
    }),
    [updateValidatorsStats],
  );
};
