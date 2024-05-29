import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client, createClient as urqlCreateClient } from 'urql';
import {
  Network,
  getDomainName,
  recreateGraphQLConnection,
  recreateAPIConnection,
  recreateFaucetConnection,
  networkRedirect,
  recreateRPCConnection,
} from '../utils';

import {
  OVERRIDE_RPC_PROVIDER,
  OVERRIDE_GRAPHQL,
  OVERRIDE_API,
  OVERRIDE_FAUCET,
  IS_PRNET,
} from '../api';

type Context = {
  networks: string[];
  currentNetwork: string;
  graphQLClient: Client;
  backendEndpoint: string;
  rpcEndpoint: string;
  faucetEndpoint: string;
  setNetwork: (network: string) => void;
};

const createClient = (endpoint: string): Client =>
  urqlCreateClient({
    url: endpoint,
    requestPolicy: 'network-only',
  });

const initialState: Context = {
  networks: Object.values(Network),
  currentNetwork: Network.MAINNET,
  graphQLClient: createClient(recreateGraphQLConnection(Network.MAINNET)),
  backendEndpoint: recreateAPIConnection(Network.MAINNET),
  rpcEndpoint: recreateRPCConnection(Network.MAINNET),
  faucetEndpoint: recreateFaucetConnection(Network.MAINNET),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setNetwork: (network: string) => {}, // eslint-disable-line @typescript-eslint/no-empty-function
};

const ExplorerNetworkContext = createContext<Context>(initialState);

const useNetworkSelection = () => {
  let networks: string[] = Object.values(Network);

  if (IS_PRNET) {
    networks = ['PRNET'];
  }

  const hostNetwork = getDomainName();
  const [currentNetwork, setCurrentNetwork] = useState<string>(
    IS_PRNET ? 'PRNET' : hostNetwork || Network.MAINNET
  );

  const [graphQLClient, setGraphQLClient] = useState<Client>(
    createClient(
      IS_PRNET ? OVERRIDE_GRAPHQL : recreateGraphQLConnection(currentNetwork)
    )
  );
  const [backendEndpoint, setBackendEndpoint] = useState<string>(
    IS_PRNET && OVERRIDE_API !== ''
      ? OVERRIDE_API
      : recreateAPIConnection(currentNetwork)
  );
  const [rpcEndpoint, setRpcEndpoint] = useState<string>(
    IS_PRNET ? OVERRIDE_RPC_PROVIDER : recreateRPCConnection(currentNetwork)
  );
  const [faucetEndpoint, setFaucetEndpoint] = useState<string>(
    IS_PRNET && OVERRIDE_FAUCET !== ''
      ? OVERRIDE_FAUCET
      : recreateFaucetConnection(currentNetwork)
  );

  const setNetwork = (network: string) => {
    setCurrentNetwork(network);
  };

  useEffect(() => {
    if (IS_PRNET) {
      return;
    }
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
