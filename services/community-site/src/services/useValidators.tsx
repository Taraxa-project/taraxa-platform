import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

import { Validator } from '@taraxa_project/taraxa-sdk';
import { useLoading } from './useLoading';
import useDpos from './useDpos';

export default () => {
  const { startLoading, finishLoading } = useLoading();

  const { mainnetDpos, browserDpos } = useDpos();

  const getValidators = useCallback(async (): Promise<Validator[]> => {
    startLoading!();
    const validators = await mainnetDpos!.getValidators();
    finishLoading!();
    return validators;
  }, [mainnetDpos]);

  const getValidatorsWith = useCallback(
    async (addresses: string[]): Promise<Validator[]> => {
      startLoading!();
      const validators = await mainnetDpos!.getValidatorsWith(addresses);
      finishLoading!();
      return validators;
    },
    [mainnetDpos],
  );

  const getValidator = useCallback(
    async (address: string): Promise<Validator> => {
      startLoading!();
      const validator = await mainnetDpos!.getValidator(address);
      finishLoading!();
      return validator;
    },
    [mainnetDpos],
  );

  const getValidatorsFor = useCallback(
    async (address: string): Promise<Validator[]> => {
      startLoading!();
      const validators = await mainnetDpos!.getValidatorsFor(address);
      finishLoading!();
      return validators;
    },
    [mainnetDpos],
  );

  const isValidatorEligible = useCallback(
    async (address: string): Promise<boolean> => {
      startLoading!();
      const isEligible = await mainnetDpos!.isValidatorEligible(address);
      finishLoading!();
      return isEligible;
    },
    [mainnetDpos],
  );

  const registerValidator = useCallback(
    async (
      validator: string,
      proof: string,
      vrfKey: string,
      commission: number,
      description: string,
      endpoint: string,
    ): Promise<ethers.providers.TransactionResponse> => {
      const overrides: ethers.PayableOverrides = {
        value: ethers.BigNumber.from(1000).mul(ethers.BigNumber.from(10).pow(18)),
      };

      return await browserDpos!.registerValidator(
        validator,
        proof,
        vrfKey,
        commission * 100,
        description,
        endpoint,
        overrides,
      );
    },
    [browserDpos],
  );

  const setValidatorInfo = useCallback(
    async (
      validator: string,
      description: string,
      endpoint: string,
    ): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.setValidatorInfo(validator, description, endpoint);
    },
    [browserDpos],
  );

  const setCommission = useCallback(
    async (
      validator: string,
      commission: number,
    ): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.setCommission(validator, commission * 100);
    },
    [browserDpos],
  );

  return useMemo(
    () => ({
      getValidators,
      getValidatorsWith,
      getValidator,
      registerValidator,
      getValidatorsFor,
      setValidatorInfo,
      setCommission,
      isValidatorEligible,
    }),
    [getValidators, getValidatorsWith, getValidator],
  );
};
