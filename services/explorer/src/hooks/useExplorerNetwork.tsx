import React, { createContext, useContext, useState } from 'react';

export enum Network {
  TESTNET = 'Californicum Testnet',
  MAINNET = 'Mainnet Candidate',
}

type Context = {
  networks: string[];
  currentNetwork: string;
  setCurrentNetwork: (network: string) => void;
};

const initialState: Context = {
  networks: Object.values(Network),
  currentNetwork: Network.MAINNET,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCurrentNetwork: (network: string) => {}, // eslint-disable-line @typescript-eslint/no-empty-function
};

const ExplorerNetworkContext = createContext<Context>(initialState);

const useNetworkSelection = () => {
  const networks = Object.values(Network);
  const [currentNetwork, setCurrentNetwork] = useState<string>(Network.TESTNET);

  return {
    networks,
    setCurrentNetwork,
    currentNetwork,
  };
};

export const ExplorerNetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const explorerNetwork = useNetworkSelection();
  return (
    <ExplorerNetworkContext.Provider value={explorerNetwork}>
      {children}
    </ExplorerNetworkContext.Provider>
  );
};

export const useExplorerNetwork = () => {
  return useContext(ExplorerNetworkContext);
};
