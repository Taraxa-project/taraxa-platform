import { useMemo } from "react";
import { ethers } from "ethers";
import useChain from "./useChain";

function useClaim() {
  const { provider, signer } = useChain();

  const instance = useMemo(() => {
    let instance;

    if (!provider || !signer) {
      return instance;
    }

    const abi = [
      "function claim(address,uint,uint,bytes)",
      "function getClaimedAmount(address,uint,uint) view returns (uint)",
    ];
    try {
      const contract = new ethers.Contract(
        process.env.REACT_APP_CLAIM_ADDRESS!,
        abi,
        provider
      );
      instance = contract.connect(signer);
    } catch (e) {
      instance = undefined;
    }

    return instance;
  }, [provider, signer]);

  return instance;
}

export default useClaim;
