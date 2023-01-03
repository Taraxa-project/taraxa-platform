import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client, createClient as urqlCreateClient } from 'urql';
import {
  Network,
  getDomainName,
  SELECTED_NETWORK,
  recreateGraphQLConnection,
  recreateAPIConnection,
  recreateFaucetConnection,
} from '../utils';

type Context = {
  networks: string[];
  currentNetwork: string;
  graphQLClient: Client;
  backendEndpoint: string;
  faucetEndpoint: string;
  setNetwork: (network: string) => void;
  disableNetworkSelection: boolean;
};

const createClient = (endpoint: string): Client =>
  urqlCreateClient({
    url: endpoint,
  });
const initialState: Context = {
  networks: Object.values(Network),
  currentNetwork: Network.MAINNET,
  graphQLClient: createClient(recreateGraphQLConnection()),
  backendEndpoint: recreateAPIConnection(),
  faucetEndpoint: recreateFaucetConnection(),
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

  const [graphQLClient, setGraphQLClient] = useState<Client>(
    createClient(recreateGraphQLConnection())
  );
  const [backendEndpoint, setBackendEndpoint] = useState<string>(
    recreateAPIConnection()
  );
  const [faucetEndpoint, setFaucetEndpoint] = useState<string>(
    recreateFaucetConnection()
  );
  const setNetwork = (network: string) => {
    setCurrentNetwork(network);
    localStorage.setItem(SELECTED_NETWORK, network);

    // unfortunately we need to reload
    // window.location.reload();
  };

  useEffect(() => {
    // connector.resetClient(recreateGraphQLConnection());
    // connector.backendEndpoint = recreateAPIConnection();
    setGraphQLClient(createClient(recreateGraphQLConnection()));
    setBackendEndpoint(recreateAPIConnection());
    setFaucetEndpoint(recreateFaucetConnection());
  }, [currentNetwork]);

  return {
    networks,
    setNetwork,
    currentNetwork,
    graphQLClient,
    backendEndpoint,
    faucetEndpoint,
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
