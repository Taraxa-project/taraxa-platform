import { useMemo } from 'react';
import { ethers } from 'ethers';
import useChain from './useChain';

function useToken() {
  const { provider, signer } = useChain();

  const instance = useMemo(() => {
    let instance;

    if (!provider || !signer) {
      return instance;
    }

    const abi = [
      'function approve(address,uint) public returns (bool)',
      'function allowance(address,address) public view returns (uint)',
      'function balanceOf(address) view returns (uint)',
    ];
    try {
      const contract = new ethers.Contract(process.env.REACT_APP_TARA_ADDRESS!, abi, provider);
      instance = contract.connect(signer);
    } catch (e) {
      instance = undefined;
    }

    return instance;
  }, [provider, signer]);

  return instance;
}

export default useToken;
