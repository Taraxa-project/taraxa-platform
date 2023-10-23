import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

import { Delegation, Undelegation } from '@taraxa_project/taraxa-sdk';

import { useLoading } from './useLoading';
import useDpos from './useDpos';

export default () => {
  const { startLoading, finishLoading } = useLoading();
  const { mainnetDpos, browserDpos } = useDpos();

  const getDelegations = useCallback(
    async (address: string): Promise<Delegation[]> => {
      return await mainnetDpos!.getDelegations(address);
    },
    [mainnetDpos],
  );

  const getUndelegations = useCallback(
    async (address: string): Promise<Undelegation[]> => {
      startLoading!();
      const undelegations = await mainnetDpos!.getUndelegations(address);
      finishLoading!();
      return undelegations;
    },
    [mainnetDpos],
  );

  const delegate = useCallback(
    async (
      address: string,
      value: ethers.BigNumber,
    ): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.delegate(address, value);
    },
    [browserDpos],
  );

  const reDelegate = useCallback(
    async (
      from: string,
      to: string,
      value: ethers.BigNumber,
    ): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.reDelegate(from, to, value);
    },
    [browserDpos],
  );

  const undelegate = useCallback(
    async (
      address: string,
      value: ethers.BigNumber,
    ): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.undelegate(address, value);
    },
    [browserDpos],
  );

  const confirmUndelegate = useCallback(
    async (address: string): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.confirmUndelegate(address);
    },
    [browserDpos],
  );

  const cancelUndelegate = useCallback(
    async (address: string): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.cancelUndelegate(address);
    },
    [browserDpos],
  );

  const claimRewards = useCallback(
    async (address: string): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.claimRewards(address);
    },
    [browserDpos],
  );

  const claimCommissionRewards = useCallback(
    async (address: string): Promise<ethers.providers.TransactionResponse> => {
      return await browserDpos!.claimCommissionRewards(address);
    },
    [browserDpos],
  );

  const claimAllRewards = useCallback(async (): Promise<ethers.providers.TransactionResponse> => {
    return await browserDpos!.claimAllRewards();
  }, [browserDpos]);

  return useMemo(
    () => ({
      claimRewards,
      claimCommissionRewards,
      delegate,
      undelegate,
      confirmUndelegate,
      cancelUndelegate,
      reDelegate,
      getDelegations,
      getUndelegations,
      claimAllRewards,
    }),
    [
      claimRewards,
      claimCommissionRewards,
      delegate,
      reDelegate,
      undelegate,
      getDelegations,
      getUndelegations,
      claimAllRewards,
    ],
  );
};
