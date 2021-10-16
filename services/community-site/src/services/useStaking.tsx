import { useMemo } from 'react';
import { ethers } from 'ethers';
import useChain from './useChain';

function useStaking() {
  const { provider, signer } = useChain();

  const instance = useMemo(() => {
    let instance = undefined;

    if (!provider || !signer) {
      return instance;
    }

    const abi = [
      'function lockingPeriod() view returns (uint)',
      'function stakeOf(address) view returns (uint,uint,uint)',
      'function stake(uint)',
      'function unstake()',
    ];
    try {
      const contract = new ethers.Contract(process.env.REACT_APP_STAKING_ADDRESS!, abi, provider);
      instance = contract.connect(signer);
    } catch (e) {
      instance = undefined;
    }

    return instance;
  }, [provider, signer]);

  return instance;
}

export default useStaking;
