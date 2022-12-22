import React, { useState, useContext, createContext } from "react";

type Context = {
  isLoading: boolean;
  startLoading?: () => void;
  finishLoading?: () => void;
};

const initialState: Context = {
  isLoading: false,
};

const LoadingContext = createContext<Context>(initialState);

function useProvideLoading() {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount((prevCount) => prevCount + 1);
  const finishLoading = () => setLoadingCount((prevCount) => prevCount - 1);

  return { isLoading: loadingCount > 0, startLoading, finishLoading };
}

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const loading = useProvideLoading();
  return (
    <LoadingContext.Provider value={loading}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  return useContext(LoadingContext);
};
