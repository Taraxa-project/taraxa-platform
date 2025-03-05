import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { ethers } from 'ethers';
import {
  ContractValidator,
  Validator,
  ValidatorStatus,
  ValidatorType,
} from '../interfaces/Validator';
import { useLoading } from './useLoading';
import { useDpos } from './useDpos';
import useApi from './useApi';
import { networks } from '../utils/networks';

export type ValidatorStats = { address: string; pbftCount: number; rank: number };

const maxDelegation = ethers.BigNumber.from(80000000).mul(ethers.BigNumber.from(10).pow(18));
const contractToValidator = (contractValidator: ContractValidator) => ({
  address: contractValidator.account,
  owner: contractValidator.info.owner,
  commission: +(parseFloat(`${contractValidator.info.commission}` || '0') / 100).toPrecision(2),
  commissionReward: contractValidator.info.commission_reward,
  lastCommissionChange: contractValidator.info.last_commission_change,
  delegation: contractValidator.info.total_stake,
  availableForDelegation: maxDelegation.sub(contractValidator.info.total_stake),
  isFullyDelegated: contractValidator.info.total_stake.eq(maxDelegation),
  isActive: false,
  status: ValidatorStatus.NOT_ELIGIBLE,
  description: contractValidator.info.description,
  endpoint: contractValidator.info.endpoint,
  rank: 0,
  pbftsProduced: 0,
  yield: 0,
  type: ValidatorType.MAINNET,
  registrationBlock: 0,
});

type ValidatorsContextType = {
  // From useValidators
  getValidators: () => Promise<Validator[]>;
  getValidatorsWith: (addresses: string[]) => Promise<Validator[]>;
  getValidator: (address: string) => Promise<Validator>;
  registerValidator: (
    validator: string,
    proof: string,
    vrfKey: string,
    commission: number,
    description: string,
    endpoint: string,
  ) => Promise<any>;
  getValidatorsFor: (address: string) => Promise<Validator[]>;
  setValidatorInfo: (validator: string, description: string, endpoint: string) => Promise<any>;
  setCommission: (validator: string, commission: number) => Promise<any>;
  isValidatorEligible: (address: string) => Promise<boolean>;

  // From useExplorerStats
  updateValidatorsStats: (validators: Validator[]) => Promise<Validator[]>;
  updateValidatorsRank: (validators: Validator[]) => Promise<Validator[]>;
  updateTestnetValidatorsStats: (validators: Validator[]) => Promise<Validator[]>;
  updateTestnetValidatorsRank: (validators: Validator[]) => Promise<Validator[]>;

  // From useAllValidators
  allValidatorsWithStats: Validator[];

  // From useValidatorsWeeklyStats
  validatorWeekStats: ValidatorStats[];
  getPbftBlocksProduced: (address: string) => number;
};

const ValidatorsContext = createContext<ValidatorsContextType | null>(null);

export const ValidatorsProvider = ({ children }: { children: React.ReactNode }) => {
  const { mainnetDpos, browserDpos } = useDpos();
  const chainId = useMemo(() => parseInt(process.env.REACT_APP_MAINNET_CHAIN_ID!, 10), []);
  const { startLoading, finishLoading } = useLoading();
  const { get } = useApi();

  // Add initialization ref to prevent multiple fetches
  const initializationInProgress = useRef(false);
  const validatorsCache = useRef<Validator[]>([]);
  const validatorWeekStats = useRef<ValidatorStats[]>([]);
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  const [allValidatorsWithStats, setAllValidatorsWithStats] = useState<Validator[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchValidatorStatsForWeek = useCallback(async (): Promise<void> => {
    let start = 0;
    let hasNextPage = true;
    while (hasNextPage) {
      try {
        const allValidators = await get(
          `${networks[chainId].indexerUrl}/validators?limit=100&start=${start}`,
        );
        if (allValidators.success) {
          validatorWeekStats.current = [
            ...validatorWeekStats.current,
            ...allValidators.response.data,
          ];
          hasNextPage = allValidators.response.hasNext;
          start += 100;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        hasNextPage = false;
      }
    }
  }, []);

  const getPbftBlocksProduced = (address: string) => {
    const pbftsProduced =
      validatorWeekStats.current.find(
        (stat) => stat.address.toLowerCase() === address.toLowerCase(),
      )?.pbftCount || 0;

    return pbftsProduced;
  };

  const getValidators = useCallback(async (): Promise<Validator[]> => {
    // Check if we have cached data that's still fresh
    const now = Date.now();
    if (validatorsCache.current.length > 0 && now - lastFetchTime.current < CACHE_DURATION) {
      // eslint-disable-next-line no-console
      console.log('Using cached validators data');
      return validatorsCache.current;
    }

    // eslint-disable-next-line no-console
    console.log('Fetching new validators data'); // Track when we're actually making RPC calls
    if (!mainnetDpos) return [];
    try {
      let validators: ContractValidator[] = [];
      let page = 0;
      let hasNextPage = true;
      while (hasNextPage) {
        try {
          // eslint-disable-next-line no-console
          console.log('Fetching validators page:', page); // Track pagination requests
          const allValidators = await mainnetDpos.getValidators(page);
          validators = [...validators, ...allValidators.validators];
          hasNextPage = !allValidators.end;
          page++;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Error fetching validators:', e);
          hasNextPage = false;
        }
      }
      const result = validators.map(contractToValidator);
      validatorsCache.current = result;
      lastFetchTime.current = now;
      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error in getValidators:', e);
      return validatorsCache.current;
    }
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

  const getStats = async (validator: Validator, chain: number) => {
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

    if (validator.type === ValidatorType.MAINNET) {
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
    async (validators: Validator[]): Promise<Validator[]> => {
      if (validators.length === 0) {
        return [] as Validator[];
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          const validatorWithStats = await getStats(validator, chainId);
          const pbftsProduced = getPbftBlocksProduced(validatorWithStats.address);
          return {
            ...validatorWithStats,
            pbftsProduced,
          };
        }),
      );
      return newValidators as Validator[];
    },
    [get, validatorWeekStats, getPbftBlocksProduced],
  );

  const updateTestnetValidatorsStats = useCallback(
    async (validators: Validator[]) => {
      if (validators.length === 0) {
        return validators;
      }

      const newValidators = await Promise.all(
        validators.map(async (validator) => {
          return getStats(validator, 842);
        }),
      );

      return newValidators as Validator[];
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
          const percentage = Number.parseFloat(ranking.response.yield || 0) * 100;

          return {
            ...validator,
            rank,
            yield: Number(percentage.toFixed(2)),
            registrationBlock: ranking.response.registrationBlock,
          };
        }),
      );

      return newValidators;
    },
    [get],
  );

  const updateTestnetValidatorsRank = useCallback(
    async (validators: Validator[]) => {
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
          const { rank, registrationBlock } = ranking.response;
          return {
            ...validator,
            rank,
            registrationBlock,
          };
        }),
      );

      return newValidators;
    },
    [get],
  );

  useEffect(() => {
    if (validatorWeekStats.current.length === 0) {
      // Fetch validator stats only if not already fetched
      fetchValidatorStatsForWeek();
    }
  }, [fetchValidatorStatsForWeek]);

  // Initial fetch
  useEffect(() => {
    if (!mainnetDpos || isInitialized || initializationInProgress.current) {
      return;
    }

    const fetchValidators = async () => {
      if (initializationInProgress.current) return;
      initializationInProgress.current = true;

      try {
        startLoading!();
        const myValidators = await getValidators();
        const validatorsWithRank = await updateValidatorsRank(myValidators);
        const validatorsWithStats = await updateValidatorsStats(validatorsWithRank);
        setAllValidatorsWithStats(validatorsWithStats);
        setIsInitialized(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error fetching initial validators:', e);
      } finally {
        finishLoading!();
        initializationInProgress.current = false;
      }
    };

    fetchValidators();
  }, [mainnetDpos, isInitialized]);

  // Log when the provider re-renders
  // eslint-disable-next-line no-console
  console.log('ValidatorsProvider render');

  const value = useMemo(
    () => ({
      // From useValidators
      getValidators,
      getValidatorsWith,
      getValidator,
      registerValidator,
      getValidatorsFor,
      setValidatorInfo,
      setCommission,
      isValidatorEligible,

      // From useExplorerStats
      updateValidatorsStats,
      updateValidatorsRank,
      updateTestnetValidatorsStats,
      updateTestnetValidatorsRank,

      // From useAllValidators
      allValidatorsWithStats,

      // From useValidatorsWeeklyStats
      validatorWeekStats: validatorWeekStats.current,
      getPbftBlocksProduced,
    }),
    [
      getValidators,
      getValidatorsWith,
      getValidator,
      registerValidator,
      getValidatorsFor,
      setValidatorInfo,
      setCommission,
      isValidatorEligible,
      updateValidatorsStats,
      updateValidatorsRank,
      updateTestnetValidatorsStats,
      updateTestnetValidatorsRank,
      allValidatorsWithStats,
      validatorWeekStats,
      getPbftBlocksProduced,
    ],
  );

  return <ValidatorsContext.Provider value={value}>{children}</ValidatorsContext.Provider>;
};

export function useValidators() {
  const context = useContext(ValidatorsContext);
  if (!context) {
    throw new Error('useValidators must be used within ValidatorsProvider');
  }
  return context;
}
