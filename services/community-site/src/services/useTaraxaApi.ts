import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import useApi from './useApi';
import { Validator, ValidatorApi, ValidatorStatus, ValidatorType } from '../interfaces/Validator';
import { useLoading } from './useLoading';

export default () => {
  const basePath = process.env.REACT_APP_API_TARAXA_HOST || '';
  const { get } = useApi(basePath);
  const { startLoading, finishLoading } = useLoading();

  const maxDelegation = ethers.BigNumber.from(80000000).mul(ethers.BigNumber.from(10).pow(18));
  const apiValidatorToValidator = (apiValidator: ValidatorApi) => ({
    address: apiValidator.address,
    owner: apiValidator.owner,
    commission: apiValidator.commission,
    commissionReward: BigNumber.from(apiValidator.commissionReward),
    lastCommissionChange: BigNumber.from(apiValidator.lastCommissionChange).toNumber(),
    delegation: BigNumber.from(apiValidator.delegation),
    availableForDelegation: maxDelegation.sub(BigNumber.from(apiValidator.delegation)),
    isFullyDelegated: ethers.BigNumber.from(apiValidator.delegation).eq(maxDelegation),
    isActive: false,
    status: ValidatorStatus.NOT_ELIGIBLE,
    description: apiValidator.description,
    endpoint: apiValidator.endpoint,
    rank: 0,
    pbftsProduced: 0,
    yield: 0,
    type: ValidatorType.MAINNET,
    registrationBlock: 0,
  });

  const getValidators = useCallback(async (): Promise<Validator[]> => {
    const request = await get(`${basePath}/validators/mainnet`);
    const validators = request.response;
    return validators.map((validator: ValidatorApi) => apiValidatorToValidator(validator));
  }, []);

  const getValidatorsWith = useCallback(async (addresses: string[]): Promise<Validator[]> => {
    if (addresses.length === 0) {
      return [];
    }
    startLoading!();

    const validators: ValidatorApi[] = await Promise.all(
      addresses.map(async (address) => {
        const validator = await get(`${basePath}/validators/mainnet/${address}`);
        return validator.response;
      }),
    );

    finishLoading!();
    return validators.map((validator) => apiValidatorToValidator(validator));
  }, []);

  const getValidator = useCallback(async (address: string): Promise<Validator> => {
    startLoading!();
    const validator = await get(`${basePath}/validators/mainnet/${address}`);

    finishLoading!();
    return apiValidatorToValidator(validator.response);
  }, []);

  const getValidatorsFor = useCallback(async (address: string): Promise<Validator[]> => {
    startLoading!();

    const request = await get(`${basePath}/validators/mainnet?owner=${address}`);
    const validators = request.response;
    finishLoading!();
    return validators.map((validator: ValidatorApi) => apiValidatorToValidator(validator));
  }, []);

  return useMemo(
    () => ({
      getValidators,
      getValidatorsWith,
      getValidatorsFor,
      getValidator,
    }),
    [getValidators, getValidatorsWith, getValidatorsFor, getValidator],
  );
};
