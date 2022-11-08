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
            `${
              process.env.REACT_APP_API_EXPLORER_HOST
            }/address/${validator.address.toLowerCase()}/stats`,
          );
          if (!status.success) {
            return validator;
          }
          const lastBlockTimestamp = status.response.lastBlockTimestamp;
          if (!lastBlockTimestamp) {
            return validator;
          }
          const lastBlockDate = new Date(lastBlockTimestamp);
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
