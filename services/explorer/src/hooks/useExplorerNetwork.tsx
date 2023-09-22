import React, { createContext, useContext, useEffect, useState } from 'react';
import { NetworkName } from '@taraxa_project/taraxa-sdk';
import { Client, createClient as urqlCreateClient } from 'urql';
import {
  getDomainName,
  recreateGraphQLConnection,
  recreateAPIConnection,
  recreateFaucetConnection,
  networkRedirect,
  recreateRPCConnection,
} from '../utils';

type Context = {
  networks: string[];
  currentNetwork: string;
  graphQLClient: Client;
  backendEndpoint: string;
  rpcEndpoint: string;
  faucetEndpoint: string;
  setNetwork: (network: string) => void;
  disableNetworkSelection: boolean;
};

const createClient = (endpoint: string): Client =>
  urqlCreateClient({
    url: endpoint,
    requestPolicy: 'network-only',
  });
const initialState: Context = {
  networks: Object.values(NetworkName),
  currentNetwork: NetworkName.MAINNET,
  graphQLClient: createClient(recreateGraphQLConnection(NetworkName.MAINNET)),
  backendEndpoint: recreateAPIConnection(NetworkName.MAINNET),
  rpcEndpoint: recreateRPCConnection(NetworkName.MAINNET),
  faucetEndpoint: recreateFaucetConnection(NetworkName.MAINNET),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setNetwork: (network: string) => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  disableNetworkSelection: false,
};

const ExplorerNetworkContext = createContext<Context>(initialState);

const useNetworkSelection = () => {
  const networks = Object.values(NetworkName);
  const hostNetwork = getDomainName();
  const [currentNetwork, setCurrentNetwork] = useState<string>(
    hostNetwork || NetworkName.MAINNET
  );

  const [graphQLClient, setGraphQLClient] = useState<Client>(
    createClient(recreateGraphQLConnection(currentNetwork))
  );
  const [backendEndpoint, setBackendEndpoint] = useState<string>(
    recreateAPIConnection(currentNetwork)
  );
  const [rpcEndpoint, setRpcEndpoint] = useState<string>(
    recreateRPCConnection(currentNetwork)
  );
  const [faucetEndpoint, setFaucetEndpoint] = useState<string>(
    recreateFaucetConnection(currentNetwork)
  );

  const setNetwork = (network: string) => {
    setCurrentNetwork(network);
  };

  useEffect(() => {
    setGraphQLClient(createClient(recreateGraphQLConnection(currentNetwork)));
    setBackendEndpoint(recreateAPIConnection(currentNetwork));
    setRpcEndpoint(recreateRPCConnection(currentNetwork));
    setFaucetEndpoint(recreateFaucetConnection(currentNetwork));
    networkRedirect(currentNetwork);
  }, [currentNetwork]);

  return {
    networks,
    setNetwork,
    currentNetwork,
    graphQLClient,
    backendEndpoint,
    rpcEndpoint,
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
