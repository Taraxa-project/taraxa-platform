import React, { createContext, useContext, useState } from 'react';
import { Network, getDomainName, SELECTED_NETWORK } from '../utils';

type Context = {
  networks: string[];
  currentNetwork: string;
  setNetwork: (network: string) => void;
  disableNetworkSelection: boolean;
};

const initialState: Context = {
  networks: Object.values(Network),
  currentNetwork: Network.MAINNET,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setNetwork: (network: string) => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  disableNetworkSelection: false,
};

const ExplorerNetworkContext = createContext<Context>(initialState);

const useNetworkSelection = () => {
  const networks = Object.values(Network);
  const savedNetwork = localStorage.getItem(SELECTED_NETWORK);
  const hostNetwork = getDomainName();
  const [currentNetwork, setCurrentNetwork] = useState<string>(
    hostNetwork || savedNetwork || Network.DEVNET
  );

  const setNetwork = (network: string) => {
    setCurrentNetwork(network);
    localStorage.setItem(SELECTED_NETWORK, network);
    // unfortunately we need to reload
    window.location.reload();
  };

  return {
    networks,
    setNetwork,
    currentNetwork,
    disableNetworkSelection: !!hostNetwork,
  };
};

export const ExplorerNetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const explorerNetwork = useNetworkSelection();
  return (
    <ExplorerNetworkContext.Provider value={explorerNetwork}>
      {children}
    </ExplorerNetworkContext.Provider>
  );
};

export const useExplorerNetwork = (): Context => {
  return useContext(ExplorerNetworkContext);
};
