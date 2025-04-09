import { ethers } from 'ethers';
import { useMemo } from 'react';
import { networks } from '../utils/networks';

function useMainnet() {
  const chainId = useMemo(() => parseInt(process.env.REACT_APP_MAINNET_CHAIN_ID!, 10), []);
  const rpcUrl = useMemo(() => networks[chainId].rpcUrl, [chainId]);
  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(rpcUrl), [rpcUrl]);

  return { chainId, provider };
}

export default useMainnet;
