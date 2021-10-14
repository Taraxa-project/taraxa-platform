import { ethers } from "ethers";
import { useMetaMask } from "metamask-react";
import { useMemo } from "react";

function useChain() {
  const { chainId, ethereum } = useMetaMask();

  const provider = useMemo(() => {
    let provider = undefined;
    try {
      provider = new ethers.providers.Web3Provider(ethereum)
    } catch (e) {
      provider = undefined;
    }

    return provider;
  }, [ethereum]);

  const signer = useMemo(() => {
    let signer = undefined;
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

  return { chainId, provider, signer };
}

export default useChain;
