import React, { createContext, useContext, useMemo } from 'react';
import { ethers } from 'ethers';
import useMainnet from './useMainnet';
import useChain from './useChain';

type DposContextType = {
  mainnetDpos: ethers.Contract | undefined;
  browserDpos: ethers.Contract | undefined;
};

const DposContext = createContext<DposContextType | null>(null);

const abi = [
  'function cancelUndelegate(address validator)',
  'function claimAllRewards()',
  'function claimCommissionRewards(address validator)',
  'function claimRewards(address validator)',
  'function confirmUndelegate(address validator)',
  'function delegate(address validator) payable',
  'function getDelegations(address delegator, uint32 batch) view returns (tuple(address account, tuple(uint256 stake, uint256 rewards) delegation)[] delegations, bool end)',
  'function getTotalDelegation(address delegator) view returns (uint256 total_delegation)',
  'function getTotalEligibleVotesCount() view returns (uint64)',
  'function getUndelegations(address delegator, uint32 batch) view returns (tuple(uint256 stake, uint64 block, address validator, bool validator_exists)[] undelegations, bool end)',
  'function getValidator(address validator) view returns (tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, uint16 undelegations_count, address owner, string description, string endpoint) validator_info)',
  'function getValidatorEligibleVotesCount(address validator) view returns (uint64)',
  'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, uint16 undelegations_count, address owner, string description, string endpoint) info)[] validators, bool end)',
  'function getValidatorsFor(address owner, uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, uint16 undelegations_count, address owner, string description, string endpoint) info)[] validators, bool end)',
  'function isValidatorEligible(address validator) view returns (bool)',
  'function reDelegate(address validator_from, address validator_to, uint256 amount)',
  'function registerValidator(address validator, bytes proof, bytes vrf_key, uint16 commission, string description, string endpoint) payable',
  'function setCommission(address validator, uint16 commission)',
  'function setValidatorInfo(address validator, string description, string endpoint)',
  'function undelegate(address validator, uint256 amount)',
];

export function DposProvider({ children }: { children: React.ReactNode }) {
  const { provider: mainnetProvider } = useMainnet();
  const { provider: browserProvider, signer } = useChain();

  const value = useMemo(() => {
    const mainnetDpos = mainnetProvider
      ? new ethers.Contract('0x00000000000000000000000000000000000000fe', abi, mainnetProvider)
      : undefined;

    const browserDpos =
      browserProvider && signer
        ? new ethers.Contract('0x00000000000000000000000000000000000000fe', abi, signer)
        : undefined;

    return {
      mainnetDpos,
      browserDpos,
    };
  }, [mainnetProvider, browserProvider, signer]);

  return <DposContext.Provider value={value}>{children}</DposContext.Provider>;
}

export function useDpos() {
  const context = useContext(DposContext);
  if (!context) {
    throw new Error('useDpos must be used within DposProvider');
  }
  return context;
}
