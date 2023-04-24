import React, { useState, useContext, createContext, useEffect } from 'react';
import { calculateValidatorYield, ValidatorWithStats } from '../interfaces/Validator';
import useValidators from './useValidators';
import useExplorerStats from './useExplorerStats';
import useCMetamask from './useCMetamask';
import { useLoading } from './useLoading';

type Context = {
  allValidatorsWithStats: ValidatorWithStats[];
};

const initialState: Context = {
  allValidatorsWithStats: [],
};

const ValidatorsContext = createContext<Context>(initialState);

const useProvideValidators = () => {
  const [allValidatorsWithStats, setAllValidatorsWithStats] = useState<ValidatorWithStats[]>([]);
  const { status } = useCMetamask();
  const { getValidators } = useValidators();
  const { updateValidatorsRank, updateValidatorsStats } = useExplorerStats();
  const { startLoading, finishLoading } = useLoading();

  const fetchValidators = () => {
    if (status === 'connected') {
      (async () => {
        startLoading!();
        const myValidators = await getValidators();
        const updatedValidators = await updateValidatorsRank(myValidators);
        const validatorsWithStats = await updateValidatorsStats(updatedValidators);
        const validatorsWithYieldEfficiency = calculateValidatorYield(validatorsWithStats);
        finishLoading!();
        setAllValidatorsWithStats(validatorsWithYieldEfficiency);
      })();
    }
  };

  useEffect(() => {
    fetchValidators();
  }, [status]);

  return {
    allValidatorsWithStats,
  };
};

export const ValidatorsProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useProvideValidators();

  return <ValidatorsContext.Provider value={value}>{children}</ValidatorsContext.Provider>;
};

export const useAllValidators = () => {
  return useContext(ValidatorsContext);
};
