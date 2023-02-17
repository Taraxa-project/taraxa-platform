import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

import Delegation, { ContractDelegation } from '../interfaces/Delegation';
import Undelegation, { ContractUndelegation } from '../interfaces/Undelegation';

import { useLoading } from './useLoading';
import useDpos from './useDpos';

export default () => {
  const { startLoading, finishLoading } = useLoading();
  const { mainnetDpos, browserDpos } = useDpos();

  const getDelegations = useCallback(
    async (address: string): Promise<Delegation[]> => {
      startLoading!();

      let newDelegations: ContractDelegation[] = [];
      let page = 0;
      let hasNextPage = true;
      while (hasNextPage) {
        try {
          const allDelegations = await mainnetDpos!.getDelegations(address, page);
          newDelegations = [...newDelegations, ...allDelegations.delegations];
          hasNextPage = !allDelegations.end;
          page++;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          hasNextPage = false;
        }
      }
      finishLoading!();

      return newDelegations.map((delegation: ContractDelegation) => ({
        address: delegation.account,
        stake: delegation.delegation.stake,
        rewards: delegation.delegation.rewards,
      }));
    },
    [mainnetDpos],
  );

  const getUndelegations = useCallback(
    async (address: string): Promise<Undelegation[]> => {
      startLoading!();

      let undelegations: ContractUndelegation[] = [];
      let page = 0;
      let hasNextPage = true;
      while (hasNextPage) {
        try {
          const allUndelegations = await mainnetDpos!.getUndelegations(address, page);
          undelegations = [...undelegations, ...allUndelegations.undelegations];
          hasNextPage = !allUndelegations.end;
          page++;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          hasNextPage = false;
        }
      }
      finishLoading!();

      return undelegations.map((undelegation: ContractUndelegation) => ({
        address: undelegation.validator,
        stake: undelegation.stake,
        block: undelegation.block.toNumber(),
      }));
    },
    [mainnetDpos],
  );

  const delegate = useCallback(
    async (address: string, value: ethers.BigNumber): Promise<void> => {
      await browserDpos!.delegate(address, {
        value,
      });
    },
    [browserDpos],
  );

  const reDelegate = useCallback(
    async (from: string, to: string, value: ethers.BigNumber): Promise<void> => {
      await browserDpos!.reDelegate(from, to, {
        value,
      });
    },
    [browserDpos],
  );

  const undelegate = useCallback(
    async (address: string, value: ethers.BigNumber): Promise<void> => {
      await browserDpos!.undelegate(address, value);
    },
    [browserDpos],
  );

  const confirmUndelegate = useCallback(
    async (address: string): Promise<void> => {
      await browserDpos!.confirmUndelegate(address);
    },
    [browserDpos],
  );

  return useMemo(
    () => ({
      delegate,
      undelegate,
      confirmUndelegate,
      reDelegate,
      getDelegations,
      getUndelegations,
    }),
    [delegate, reDelegate, undelegate, getDelegations, getUndelegations],
  );
};
