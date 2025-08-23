import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

import useDpos from './useDpos';

export default () => {
  const { browserDpos } = useDpos();

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
        commission * 100,
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
      registerValidator,
      setValidatorInfo,
      setCommission,
    }),
    [],
  );
};
