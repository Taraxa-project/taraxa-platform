import React, { useState, useContext, createContext, useEffect } from 'react';
import { calculateValidatorYield, Validator } from '../interfaces/Validator';
import useValidators from './useValidators';
import useExplorerStats from './useExplorerStats';
import { useLoading } from './useLoading';

type Context = {
  allValidatorsWithStats: Validator[];
};

const initialState: Context = {
  allValidatorsWithStats: [],
};

const ValidatorsContext = createContext<Context>(initialState);

const useProvideValidators = () => {
  const [allValidatorsWithStats, setAllValidatorsWithStats] = useState<Validator[]>([]);
  const { getValidators } = useValidators();
  const { updateValidatorsRank, updateValidatorsStats } = useExplorerStats();
  const { startLoading, finishLoading } = useLoading();

  const fetchValidators = () => {
    (async () => {
      startLoading!();
      const myValidators = await getValidators();
      setAllValidatorsWithStats(myValidators);
      finishLoading!();
      const updatedValidators = await updateValidatorsRank(myValidators);
      const validatorsWithStats = await updateValidatorsStats(updatedValidators);
      const validatorsWithYieldEfficiency = calculateValidatorYield(validatorsWithStats);
      setAllValidatorsWithStats(validatorsWithYieldEfficiency);
    })();
  };

  useEffect(() => {
    fetchValidators();
  }, []);

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
