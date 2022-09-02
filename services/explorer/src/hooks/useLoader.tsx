import React, { createContext, useContext, useState } from 'react';

type Context = {
  isLoading: boolean;
  initLoading?: () => void;
  finishLoading?: () => void;
};

const initialState: Context = {
  isLoading: false,
};

const ExplorerLoaderContext = createContext<Context>(initialState);

const useProvideLoading = () => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const initLoading = () => {
    setLoading(true);
  };
  const finishLoading = () => {
    setLoading(false);
  };
  return {
    isLoading,
    initLoading,
    finishLoading,
  };
};

export const ExplorerLoaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const loading = useProvideLoading();
  return (
    <ExplorerLoaderContext.Provider value={loading}>
      {children}
    </ExplorerLoaderContext.Provider>
  );
};

export const useExplorerLoader = () => {
  return useContext(ExplorerLoaderContext);
};
