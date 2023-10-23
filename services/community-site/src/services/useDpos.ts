import { useMemo } from 'react';
import { DposClient, NetworkName, ProviderType } from '@taraxa_project/taraxa-sdk';
import useChain from './useChain';

function useDpos() {
  const networkName = NetworkName.MAINNET;
  const { chainId } = useChain();

  const mainnetDpos = useMemo(() => {
    try {
      return new DposClient(networkName, ProviderType.RPC);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error initializing mainnet DposClient:', e);
      return undefined;
    }
  }, [networkName]);

  const browserDpos = useMemo(() => {
    if (!chainId) return undefined;

    try {
      return new DposClient(chainId, ProviderType.WEB3);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error initializing browser DposClient:', e);
      return undefined;
    }
  }, [chainId]);

  return {
    mainnetDpos,
    browserDpos,
  };
}

export default useDpos;
