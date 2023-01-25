import { ethers } from 'ethers';
import { useMemo } from 'react';
import { Network } from 'src/utils';
import { useExplorerNetwork } from './useExplorerNetwork';

function useChain(): {
  provider: ethers.providers.JsonRpcProvider | undefined;
  signer: ethers.providers.JsonRpcSigner | undefined;
  checkCode: (account: string) => Promise<boolean>;
} {
  const { currentNetwork } = useExplorerNetwork();

  const provider = useMemo(() => {
    let provider;
    try {
      let currentProvider = `${process.env.REACT_APP_TARAXA_MAINNET_PROVIDER}`;
      const networkDetails = { name: 'Taraxa Mainnet', chainId: 841 };
      switch (currentNetwork) {
        case Network.MAINNET: {
          currentProvider = `${process.env.REACT_APP_TARAXA_MAINNET_PROVIDER}`;
          networkDetails.name = 'Taraxa Mainnet';
          networkDetails.chainId = 841;
          break;
        }
        case Network.TESTNET: {
          currentProvider = `${process.env.REACT_APP_TARAXA_TESTNET_PROVIDER}`;
          networkDetails.name = 'Taraxa Testnet';
          networkDetails.chainId = 842;
          break;
        }
        case Network.DEVNET: {
          currentProvider = `${process.env.REACT_APP_TARAXA_DEVNET_PROVIDER}`;
          networkDetails.name = 'Taraxa Devnet';
          networkDetails.chainId = 843;
          break;
        }
      }
      provider = new ethers.providers.JsonRpcProvider(
        currentProvider,
        networkDetails
      );
    } catch (e) {
      provider = undefined;
    }

    return provider;
  }, [currentNetwork]);

  const signer = useMemo(() => {
    let signer;
    if (!provider) {
      return signer;
    }

    try {
      signer = provider.getSigner();
    } catch (e) {
      signer = undefined;
    }

    return signer;
  }, [provider]);

  const checkCode = async (account: string): Promise<boolean> => {
    if (account && provider) {
      try {
        const code = await provider.getCode(`0x${account}`);
        if (code && code !== '0x') {
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    }
  };

  return { provider, signer, checkCode };
}

export default useChain;
