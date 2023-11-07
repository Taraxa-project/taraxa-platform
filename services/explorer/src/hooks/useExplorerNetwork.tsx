import React, { createContext, useContext, useEffect, useState } from 'react';
import { NetworkName, getNetwork } from '@taraxa_project/taraxa-sdk';
import { Client, createClient as urqlCreateClient } from 'urql';
import { getDomainName, networkRedirect } from '../utils';

type Context = {
  networks: string[];
  currentNetwork: NetworkName;
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
  networks: Object.values(NetworkName),
  currentNetwork: NetworkName.MAINNET,
  graphQLClient: createClient(getNetwork(NetworkName.MAINNET).graphqlUrl),
  backendEndpoint: getNetwork(NetworkName.MAINNET).indexerUrl,
  rpcEndpoint: getNetwork(NetworkName.MAINNET).rpcUrl,
  faucetEndpoint: getNetwork(NetworkName.MAINNET).faucetUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setNetwork: (network: string) => {}, // eslint-disable-line @typescript-eslint/no-empty-function
};

const ExplorerNetworkContext = createContext<Context>(initialState);

const useNetworkSelection = () => {
  const networks: string[] = Object.values(NetworkName);
  const hostNetwork = getDomainName();
  const [currentNetwork, setCurrentNetwork] = useState<NetworkName>(
    hostNetwork || NetworkName.MAINNET
  );
  const selectedNetwork = getNetwork(currentNetwork);
  const [graphQLClient, setGraphQLClient] = useState<Client>(
    createClient(selectedNetwork.graphqlUrl)
  );
  const [backendEndpoint, setBackendEndpoint] = useState<string>(
    selectedNetwork.indexerUrl
  );
  const [rpcEndpoint, setRpcEndpoint] = useState<string>(
    selectedNetwork.rpcUrl
  );
  const [faucetEndpoint, setFaucetEndpoint] = useState<string>(
    selectedNetwork.faucetUrl
  );

  const setNetwork = (network: string) => {
    setCurrentNetwork(network as NetworkName);
  };

  useEffect(() => {
    setGraphQLClient(createClient(selectedNetwork.graphqlUrl));
    setBackendEndpoint(selectedNetwork.indexerUrl);
    setRpcEndpoint(selectedNetwork.rpcUrl);
    setFaucetEndpoint(selectedNetwork.faucetUrl);
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
