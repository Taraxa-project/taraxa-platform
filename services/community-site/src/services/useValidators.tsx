import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

import { ContractValidator, Validator } from '../interfaces/Validator';
import { useLoading } from './useLoading';
import useDpos from './useDpos';

export default () => {
  const { startLoading, finishLoading } = useLoading();

  const { mainnetDpos, browserDpos } = useDpos();

  const maxDelegation = ethers.BigNumber.from(80000000).mul(ethers.BigNumber.from(10).pow(18));
  const contractToValidator = (contractValidator: ContractValidator) => ({
    address: contractValidator.account,
    owner: contractValidator.info.owner,
    commission: +(parseFloat(`${contractValidator.info.commission}` || '0') / 10).toPrecision(1),
    commissionReward: contractValidator.info.commission_reward,
    lastCommissionChange: contractValidator.info.last_commission_change,
    delegation: contractValidator.info.total_stake,
    availableForDelegation: maxDelegation.sub(contractValidator.info.total_stake),
    isFullyDelegated: contractValidator.info.total_stake.eq(maxDelegation),
    isActive: false,
    description: contractValidator.info.description,
    endpoint: contractValidator.info.endpoint,
  });

  const getValidators = useCallback(async (): Promise<Validator[]> => {
    startLoading!();

    let validators: ContractValidator[] = [];
    let page = 0;
    let hasNextPage = true;
    while (hasNextPage) {
      try {
        const allValidators = await mainnetDpos!.getValidators(page);
        validators = [...validators, ...allValidators.validators];
        hasNextPage = !allValidators.end;
        page++;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        hasNextPage = false;
      }
    }

    finishLoading!();
    return validators.map((validator) => contractToValidator(validator));
  }, [mainnetDpos]);

  const getValidatorsWith = useCallback(
    async (addresses: string[]): Promise<Validator[]> => {
      if (addresses.length === 0) {
        return [];
      }
      startLoading!();

      const contractValidators: ContractValidator[] = await Promise.all(
        addresses.map(async (address) => ({
          account: address,
          info: await mainnetDpos!.getValidator(address),
        })),
      );

      finishLoading!();
      return contractValidators.map((contractValidator) => contractToValidator(contractValidator));
    },
    [mainnetDpos],
  );

  const getValidator = useCallback(
    async (address: string): Promise<Validator> => {
      startLoading!();

      const contractValidator: ContractValidator = {
        account: address,
        info: await mainnetDpos!.getValidator(address),
      };

      finishLoading!();
      return contractToValidator(contractValidator);
    },
    [mainnetDpos],
  );

  const getValidatorsFor = useCallback(
    async (address: string): Promise<Validator[]> => {
      startLoading!();

      let validators: ContractValidator[] = [];
      let page = 0;
      let hasNextPage = true;

      while (hasNextPage) {
        try {
          const allValidators = await mainnetDpos!.getValidatorsFor(address, page);
          validators = [...validators, ...allValidators.validators];
          hasNextPage = !allValidators.end;
          page++;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          hasNextPage = false;
        }
      }
      finishLoading!();
      return validators.map((validator) => contractToValidator(validator));
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
      return await browserDpos!.registerValidator(
        validator,
        proof,
        vrfKey,
        commission,
        description,
        endpoint,
        {
          value: ethers.BigNumber.from(1000).mul(ethers.BigNumber.from(10).pow(18)),
        },
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
    }),
    [getValidators, getValidatorsWith, getValidator],
  );
};
