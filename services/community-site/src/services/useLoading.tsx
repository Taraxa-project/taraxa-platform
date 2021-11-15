import React, { useState, useContext, createContext } from 'react';

type Context = {
  isLoading: boolean;
  setIsLoading?: (isLoading: boolean) => void;
};

const initialState: Context = {
  isLoading: false,
};

const LoadingContext = createContext<Context>(initialState);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const loading = useProvideLoading();
  return <LoadingContext.Provider value={loading}>{children}</LoadingContext.Provider>;
};

export const useLoading = () => {
  return useContext(LoadingContext);
};

function useProvideLoading() {
  const [isLoading, setIsLoading] = useState(false);
  return { isLoading, setIsLoading };
}
